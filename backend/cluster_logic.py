import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.preprocessing import OneHotEncoder, RobustScaler
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    silhouette_score,
    calinski_harabasz_score,
    davies_bouldin_score
)
import os

# ================== RUTA DE GRAFICAS ==================
PLOTS_DIR = "./reports"
os.makedirs(PLOTS_DIR, exist_ok=True)

class InsightClusterModel:
    def __init__(self):
        self.model = None
        self.raw_dataset = None  
        self.processed_data = None 
        self.labels = None 
        self.pipeline = None 
        self.metrics = {}
        
        self.cols_numeric = [
            'frecuencia_compra',
            'monto_total_gastado',
            'monto_promedio_compra',
            'dias_desde_ultima_compra',
            'antiguedad_cliente_meses',
            'numero_productos_distintos'
        ]

        self.cols_categorical = [
            'canal_principal',
            'producto_categoria'
        ]

        self.cols_info = [
            'cliente_id',
            'reseña_id',
            'fecha_reseña'
        ]

    # ================== CARGA ==================
    def load_data(self, file_content):
        try:
            df = pd.read_csv(file_content)

            # seguridad mínima
            df['texto_reseña'] = df.get('texto_reseña', "").fillna("")
            df['longitud_reseña'] = df['texto_reseña'].apply(
                lambda x: len(str(x).split())
            )

            for col in self.cols_numeric:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce')

            self.raw_dataset = df

            return {
                "status": "success",
                "rows": len(df),
                "columns": list(df.columns),
                "message": "Datos cargados correctamente."
            }

        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }

    # ================== PREPROCESADO ==================
    def preprocess_data(self):
        if self.raw_dataset is None:
            raise ValueError("No hay datos cargados.")

        df = self.raw_dataset.copy()

        numeric_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', RobustScaler())
        ])

        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='constant', fill_value='desconocido')),
            ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ])

        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, self.cols_numeric),
                ('cat', categorical_transformer, self.cols_categorical)
            ]
        )

        self.processed_data = preprocessor.fit_transform(df)
        self.pipeline = preprocessor

        return self.processed_data

    # ================== ENTRENAMIENTO ==================
    def train(self, n_clusters=3, max_iter=300):
        if self.raw_dataset is None:
            raise ValueError("Carga datos primero.")

        X = self.preprocess_data()

        kmeans = KMeans(
            n_clusters=n_clusters,
            max_iter=max_iter,
            random_state=42,
            n_init=20
        )

        self.labels = kmeans.fit_predict(X)
        self.model = kmeans
        self.raw_dataset['Cluster'] = self.labels

        # ================== METRICAS ==================
        inertia = kmeans.inertia_
        sil = silhouette_score(X, self.labels)
        ch = calinski_harabasz_score(X, self.labels)
        db = davies_bouldin_score(X, self.labels)

        self.metrics = {
            "inertia": round(inertia, 2),
            "silhouette": round(sil, 4),
            "calinski_harabasz": round(ch, 2),
            "davies_bouldin": round(db, 4)
        }

        # ================== GRAFICAS ==================
        self.plot_clientes_por_segmento()
        self.plot_gasto_promedio_por_segmento()
        self.plot_frecuencia_promedio_por_segmento()
        self.plot_canales_por_segmento()

        return self.metrics

    # ================== RESUMEN (SE USA EN PREVIEW) ==================
    def get_cluster_summary(self):
        if self.labels is None:
            return []

        summary = []
        for i in range(self.model.n_clusters):
            c = self.raw_dataset[self.raw_dataset['Cluster'] == i]

            summary.append({
                "cluster_id": i,
                "cantidad_clientes": int(len(c)),
                "promedio_gasto": round(c['monto_total_gastado'].mean(), 2),
                "frecuencia_promedio": round(c['frecuencia_compra'].mean(), 2),
                "canal_top": (
                    c['canal_principal'].mode()[0]
                    if not c.empty else "N/A"
                ),
                "ejemplo_reseña": (
                    c['texto_reseña'].iloc[0]
                    if not c.empty else ""
                )
            })

        return summary

    # ================== GRAFICAS ==================
    def plot_clientes_por_segmento(self):
        counts = self.raw_dataset['Cluster'].value_counts().sort_index()
        counts.plot(kind='bar', title='Distribución de Clientes por Segmento')
        plt.xlabel("Segmento")
        plt.ylabel("Clientes")
        plt.tight_layout()
        plt.savefig(f"{PLOTS_DIR}/clientes_por_segmento.png")
        plt.close()

    def plot_gasto_promedio_por_segmento(self):
        self.raw_dataset.groupby('Cluster')['monto_total_gastado'].mean().plot(
            kind='bar',
            title='Promedio de Gasto por Segmento'
        )
        plt.xlabel("Segmento")
        plt.ylabel("Gasto Promedio")
        plt.tight_layout()
        plt.savefig(f"{PLOTS_DIR}/gasto_promedio_por_segmento.png")
        plt.close()

    def plot_frecuencia_promedio_por_segmento(self):
        self.raw_dataset.groupby('Cluster')['frecuencia_compra'].mean().plot(
            kind='bar',
            title='Frecuencia Promedio de Compra'
        )
        plt.xlabel("Segmento")
        plt.ylabel("Frecuencia")
        plt.tight_layout()
        plt.savefig(f"{PLOTS_DIR}/frecuencia_promedio_por_segmento.png")
        plt.close()

    def plot_canales_por_segmento(self):
        pd.crosstab(
            self.raw_dataset['Cluster'],
            self.raw_dataset['canal_principal']
        ).plot(
            kind='bar',
            stacked=True,
            title='Distribución de Canal por Segmento'
        )
        plt.xlabel("Segmento")
        plt.ylabel("Clientes")
        plt.tight_layout()
        plt.savefig(f"{PLOTS_DIR}/canales_por_segmento.png")
        plt.close()


cluster_engine = InsightClusterModel()
