# OLC2_2SEVD25_Proyecto2_G2
### Christian David Chinchilla Santos         202308227
### Alfredo Emmanuel Dominguez Rodríguez      202300535
### Carlos Emanuel Sancir Reyes               202201131


## Ejecución del Backend

### 1. Navegar a la carpeta del backend
cd /backend

### 2. Crear entorno virtual 
python -m venv venv

### 3. Activar entorno virtual
### Windows:
.\venv\Scripts\activate

### 4. Instalar dependencias
pip install -r requirements.txt

### 5. Iniciar el servidor
uvicorn main:app --reload
### El servidor iniciará en http://127.0.0.1:8000