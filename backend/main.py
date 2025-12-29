from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, FileResponse
from pydantic import BaseModel
from typing import Optional
from cluster_logic import cluster_engine
from fastapi.staticfiles import StaticFiles
import io
import os

app = FastAPI(title="InsightCluster API", description="API de Segmentación de Clientes")

app.mount("/reports", StaticFiles(directory="reports"), name="reports")

@app.on_event("startup")
async def startup_event():
    print("Backend corriendo limpiamente")

# configurar CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# ESQUEMAS
# =========================
class TrainConfig(BaseModel):
    n_clusters: int = 3
    max_iter: int = 300
    algorithm_variant: str = "K-Means" 

# =========================
# ENDPOINTS EXISTENTES
# =========================
@app.get("/")
def home():
    return {"message": "InsightCluster Backend Running"}

# carga masiva
@app.post("/upload-csv")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Debe ser un archivo CSV.")
    
    content = await file.read()
    file_buffer = io.BytesIO(content)
    
    result = cluster_engine.load_data(file_buffer)
    
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result

# limpieza de datos
@app.post("/clean-data")
def clean_data():
    try:
        processed = cluster_engine.preprocess_data()
        return {
            "rows_processed": processed.shape[0] if hasattr(processed, 'shape') else len(processed),
            "missing_values_fixed": "Automático",
            "normalizations": "Numéricos y categóricos normalizados",
            "message": "Limpieza y normalización completadas."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# entrenamiento
@app.post("/train-model")
def train_model(config: TrainConfig):
    try:
        metrics = cluster_engine.train(
            n_clusters=config.n_clusters,
            max_iter=config.max_iter
        )
        
        segments = cluster_engine.get_cluster_summary()
        
        return {
            "message": "Entrenamiento completado exitosamente",
            "metrics": metrics,
            "segments_preview": segments
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# reporte de segmentos
@app.get("/segments-report")
def get_segments():
    if not cluster_engine.model_trained:
        raise HTTPException(status_code=400, detail="Modelo no entrenado")
    try:
        return cluster_engine.get_cluster_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# exportar datos
@app.get("/export-data")
def export_data():
    if not cluster_engine.model_trained:
        raise HTTPException(status_code=400, detail="Debe entrenar el modelo antes de exportar resultados")

    csv_content = cluster_engine.get_csv_export()
    if csv_content is None:
        raise HTTPException(status_code=404, detail="No hay datos para exportar")
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=insight_cluster_results.csv"}
    )

# sugerir mejor K
@app.get("/find-best-k")
def find_best_k(min_k: int = 2, max_k: int = 8):
    try:
        result = cluster_engine.find_best_k(min_k=min_k, max_k=max_k)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))