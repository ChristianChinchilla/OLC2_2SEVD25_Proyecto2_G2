import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.preprocessing import OneHotEncoder, StandardScaler
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
        self.model_trained = False  # Bandera de estado
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
    def handle_outliers(self, df):
        """Aplica Capping (Winsorization) a las columnas numéricas."""
        df_clean = df.copy()
        cols_to_process = [c for c in self.cols_numeric if c in df_clean.columns]
        
        for col in cols_to_process:
            # Convertir a numérico forzoso por si acaso
            df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')
            
            # Calcular límites IQR (5% - 95% para ser conservador)
            Q1 = df_clean[col].quantile(0.05)
            Q3 = df_clean[col].quantile(0.95)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            # Capping
            df_clean[col] = np.where(df_clean[col] > upper_bound, upper_bound, df_clean[col])
            df_clean[col] = np.where(df_clean[col] < lower_bound, lower_bound, df_clean[col])
            
        return df_clean

    def preprocess_data(self):
        if self.raw_dataset is None:
            raise ValueError("No hay datos cargados.")

        # 1. Limpieza de Outliers antes de escalar
        df = self.handle_outliers(self.raw_dataset)

        numeric_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
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
            init='k-means++',
            random_state=42,
            n_init=10
        )

        self.labels = kmeans.fit_predict(X)
        self.model = kmeans
        self.raw_dataset['Cluster'] = self.labels
        self.model_trained = True  # Bandera activada

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
        insights = self.generate_insights()

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
                ),
                "insight": insights.get(i, "Sin datos suficientes")
            })

        return summary

    # ================== GRAFICAS ==================
    def plot_clientes_por_segmento(self):
        counts = self.raw_dataset['Cluster'].value_counts().sort_index()

        plt.figure(figsize=(6, 6))
        plt.pie(
            counts,
            labels=[f"Cluster {i}" for i in counts.index],
            autopct='%1.1f%%',
            startangle=90
        )
        plt.title("Distribución de Clientes por Segmento")
        plt.tight_layout()
        plt.savefig(f"{PLOTS_DIR}/clientes_por_segmento.png")
        plt.close()

    def plot_gasto_promedio_por_segmento(self):
        data = self.raw_dataset.groupby('Cluster')['monto_total_gastado'].mean()
        
        labels = data.index.astype(str)
        values = data.values.tolist()
        values += values[:1]

        angles = np.linspace(0, 2*np.pi, len(labels)+1)

        plt.figure(figsize=(6,6))
        ax = plt.subplot(111, polar=True)
        ax.plot(angles, values, linewidth=2)
        ax.fill(angles, values, alpha=0.25)

        ax.set_thetagrids(angles[:-1] * 180/np.pi, labels)
        ax.set_title("Perfil de Gasto por Segmento")

        plt.tight_layout()
        plt.savefig(f"{PLOTS_DIR}/gasto_promedio_por_segmento.png")
        plt.close()


    def plot_frecuencia_promedio_por_segmento(self):
        plt.figure(figsize=(7,5))

        # --- Scatter por cluster ---
        for c in self.raw_dataset['Cluster'].unique():
            subset = self.raw_dataset[self.raw_dataset['Cluster'] == c]
            plt.scatter(
                subset['frecuencia_compra'],
                subset['monto_total_gastado'],
                label=f"Cluster {c}",
                alpha=0.6
            )

        # --- Línea polinomial global (grado 2) ---
        x = self.raw_dataset['frecuencia_compra']
        y = self.raw_dataset['monto_total_gastado']
        # Elimina NaN para el ajuste
        mask = (~x.isna()) & (~y.isna())
        x_clean = x[mask]
        y_clean = y[mask]
        if len(x_clean) > 2:
            coeffs = np.polyfit(x_clean, y_clean, deg=2)
            x_fit = np.linspace(x_clean.min(), x_clean.max(), 200)
            y_fit = np.polyval(coeffs, x_fit)
            plt.plot(x_fit, y_fit, color='black', linewidth=2, linestyle='--', label='Ajuste Polinomial (grado 2)')

        plt.xlabel("Frecuencia de Compra")
        plt.ylabel("Monto Total Gastado")
        plt.title("Frecuencia vs Gasto por Segmento")
        plt.legend()
        plt.tight_layout()
        plt.savefig(f"{PLOTS_DIR}/frecuencia_vs_gasto.png")
        plt.close()

# Dentro de cada cluster, ¿qué porcentaje de clientes usa cada canal?
    def plot_canales_por_segmento(self):
        data = pd.crosstab(
            self.raw_dataset['Cluster'],
            self.raw_dataset['canal_principal'],
            normalize='index'
        )

        data.plot(
            kind='barh',
            stacked=True,
            figsize=(8,5)
        )

        plt.xlabel("Proporción de clientes")
        plt.ylabel("Cluster")
        plt.title("Canal Principal por Segmento (Distribución Proporcional)")
        plt.legend(title="Canal", bbox_to_anchor=(1.05, 1), loc='upper left')
        plt.tight_layout()
        plt.savefig(f"{PLOTS_DIR}/canales_por_segmento.png")
        plt.close()

    def generate_insights(self):
        """Genera insights comparando cada cluster con el promedio global."""
        if self.raw_dataset is None or 'Cluster' not in self.raw_dataset.columns:
            return {}

        insights = {}
        df = self.raw_dataset
        
        try:
            # Promedios globales
            global_means = df[self.cols_numeric].mean()
            
            # Promedios por cluster
            cluster_means = df.groupby('Cluster')[self.cols_numeric].mean()
        except KeyError:
             return {i: "Datos insuficientes para insights" for i in range(self.model.n_clusters)}

        for i in range(self.model.n_clusters):
            insight_parts = []
            c_means = cluster_means.loc[i]
            
            # Comparar Gasto
            if c_means['monto_total_gastado'] > global_means['monto_total_gastado'] * 1.1:
                insight_parts.append("Gastadores Altos.")
            elif c_means['monto_total_gastado'] < global_means['monto_total_gastado'] * 0.9:
                insight_parts.append("Gastadores Bajos.")
                
            # Comparar Frecuencia
            if c_means['frecuencia_compra'] > global_means['frecuencia_compra'] * 1.1:
                insight_parts.append("Muy Frecuentes.")
            elif c_means['frecuencia_compra'] < global_means['frecuencia_compra'] * 0.9:
                insight_parts.append("Poco Frecuentes.")

            # Canal
            c_data = df[df['Cluster'] == i]
            if not c_data.empty:
                top_canal = c_data['canal_principal'].mode()[0]
                insight_parts.append(f"Canal: {top_canal}.")

            if not insight_parts:
                insight_parts.append("Comportamiento Promedio.")
                
            insights[i] = " ".join(insight_parts)
            
        return insights

    def get_csv_export(self):
        """Retorna el dataset con los clusters asignados en formato CSV."""
        if self.raw_dataset is None:
            raise ValueError("No hay datos cargados.")
        if not self.model_trained:
            raise ValueError("El modelo no ha sido entrenado. No se pueden exportar resultados.")
        return self.raw_dataset.to_csv(index=False)


cluster_engine = InsightClusterModel()
