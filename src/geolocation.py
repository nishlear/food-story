import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os

app = FastAPI()

# Mount the static directory for script.js and others
# We use os.path.dirname to make sure we find the static folder relative to this file
static_path = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=static_path), name="static")

class LocationData(BaseModel):
    latitude: float
    longitude: float
    accuracy: float = None

@app.get("/")
async def read_index():
    return FileResponse(os.path.join(static_path, 'index.html'))

@app.get("/favicon.ico")
async def favicon():
    return FileResponse(os.path.join(static_path, 'favicon.ico')) if os.path.exists(os.path.join(static_path, 'favicon.ico')) else ""

@app.post("/location")
async def receive_location(data: LocationData):
    print(f"📍 Received Location: Lat={data.latitude}, Lng={data.longitude}, Acc={data.accuracy}m")
    return {"status": "success", "received": data}

if __name__ == "__main__":
    print("Starting server at https://0.0.0.0:7330 (Use HTTPS!)")
    uvicorn.run(app, host="0.0.0.0", port=7330, ssl_keyfile="key.pem", ssl_certfile="cert.pem")
