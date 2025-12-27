import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import OneHotEncoder, RobustScaler
from sklearn.impute import SimpleImputer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import silhouette_score, calinski_harabasz_score, davies_bouldin_score
import io
import re

class InsightClusterModel:
    def __init__(self):
        self.model = None
        self.raw_dataset = None  
        self.processed_data = None 
        self.labels = None 
        self.pipeline = None 
        self.metrics = {}
        
        #definición de columnas
        self.cols_numeric = [
            'frecuencia_compra', 'monto_total_gastado', 'monto_promedio_compra', 'dias_desde_ultima_compra',
            'antiguedad_cliente_meses', 'numero_productos_distintos'
        ]

        self.cols_categorical = ['canal_principal', 'producto_categoria']
        self.cols_text = 'texto_reseña' 
        
        #columnas informativas 
        self.cols_info = ['cliente_id', 'reseña_id', 'fecha_reseña']

    def load_data(self, file_content):
        """Carga y limpieza inicial"""
        try:
            #detección de separador
            try:
                df = pd.read_csv(file_content)
                if len(df.columns) < 2:
                    file_content.seek(0)
                    df = pd.read_csv(file_content, sep=';')
            except:
                file_content.seek(0)
                df = pd.read_csv(file_content, sep=';')

            #calcular longitud_reseña
            df['texto_reseña'] = df['texto_reseña'].fillna("")
            df['longitud_reseña'] = df['texto_reseña'].apply(lambda x: len(str(x).split()))

            #limpieza de nulos en numéricos
            for col in self.cols_numeric:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce')
            
            self.raw_dataset = df
            
            return {
                "status": "success",
                "rows": len(df),
                "columns": list(df.columns),
                "message": "Datos cargados y longitud de reseñas calculada."
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def preprocess_data(self):
        """Transforma texto y números a una matriz matemática"""
        if self.raw_dataset is None:
            raise ValueError("No hay datos cargados.")
        
        df = self.raw_dataset.copy()
        
        # --- Configuración del Preprocesador ---
        
        #numéricos: imputación y escalado
        numeric_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', RobustScaler())
        ])

        #imputación y  OneHotEncoding
        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='constant', fill_value='desconocido')),
            ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ])

        #vectorizer
        text_transformer = TfidfVectorizer(max_features=30, stop_words='english')

        #unir todo
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, [c for c in self.cols_numeric if c in df.columns]),
                ('cat', categorical_transformer, [c for c in self.cols_categorical if c in df.columns])
            ])


        #aplicar transformación
        self.processed_data = preprocessor.fit_transform(df)
        self.pipeline = preprocessor
        
        return self.processed_data

    def train(self, n_clusters=3, max_iter=300):
        """Entrena K-Means y calcula métricas"""
        if self.raw_dataset is None:
            raise ValueError("Carga datos primero.")
        
        X = self.preprocess_data()
        #configurar y entrenar 
        kmeans = KMeans(n_clusters=n_clusters, max_iter=max_iter, random_state=42, n_init=20)
        self.labels = kmeans.fit_predict(X)
        self.model = kmeans
        
        #guardar resultados en el dataset original
        self.raw_dataset['Cluster'] = self.labels

        # --- Cálculo de Métricas ---
        #inercia 
        inertia = kmeans.inertia_
        
        #coeficiente de silueta
        if len(X) > 10000:
            sil_score = silhouette_score(X, self.labels, sample_size=10000)
        else:
            sil_score = silhouette_score(X, self.labels)

        #indice 
        ch_score = calinski_harabasz_score(X, self.labels)
        db_score = davies_bouldin_score(X, self.labels)

        self.metrics = {
            "inertia": round(inertia, 2),
            "silhouette": round(sil_score, 4), 
            "calinski_harabasz": round(ch_score, 2), 
            "davies_bouldin": round(db_score, 4)
        }

        return self.metrics

    def get_cluster_summary(self):
        """Genera un resumen para la interpretación de segmentos (PDF Pag 4)"""
        if self.labels is None:
            return []
        
        summary = []
        df = self.raw_dataset
        
        for i in range(self.model.n_clusters):
            cluster_data = df[df['Cluster'] == i]
            desc = {
                "cluster_id": i,
                "cantidad_clientes": int(len(cluster_data)),
                "promedio_gasto": round(cluster_data['monto_total_gastado'].mean(), 2),
                "frecuencia_promedio": round(cluster_data['frecuencia_compra'].mean(), 2),
                "canal_top": cluster_data['canal_principal'].mode()[0] if not cluster_data['canal_principal'].empty else "N/A",
                "ejemplo_reseña": cluster_data['texto_reseña'].iloc[0] if not cluster_data.empty else ""
            }
            summary.append(desc)
            
        return summary
    
    def find_best_k(self, min_k=2, max_k=10):
        """
        Busca el mejor número de clusters (k) usando el coeficiente de Silhouette.
        Retorna un diccionario con el mejor k y los valores de Silhouette para cada k.
        """
        if self.raw_dataset is None:
            raise ValueError("Carga datos primero.")
        X = self.preprocess_data()
        best_k = min_k
        best_score = -1
        silhouette_scores = {}
        for k in range(min_k, min(max_k + 1, len(X))):
            try:
                kmeans = KMeans(n_clusters=k, max_iter=300, random_state=42, n_init=10)
                labels = kmeans.fit_predict(X)
                score = silhouette_score(X, labels)
                silhouette_scores[k] = round(score, 4)
                if score > best_score:
                    best_score = score
                    best_k = k
            except Exception as e:
                silhouette_scores[k] = None  # En caso de error (por ejemplo, clusters vacíos)
        return {
            "best_k": best_k,
            "best_score": round(best_score, 4),
            "silhouette_scores": silhouette_scores
        }

    def get_csv_export(self):
        """Genera el CSV final para descargar (PDF Pag 5 y 6)"""
        if self.raw_dataset is None:
            return None
        
        #convertir DataFrame a CSV 
        stream = io.StringIO()
        self.raw_dataset.to_csv(stream, index=False)
        return stream.getvalue()

cluster_engine = InsightClusterModel()