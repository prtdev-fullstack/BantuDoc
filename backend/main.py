from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pdf2docx import Converter
import os
import uuid

# =========================
# CONFIGURATION DES DOSSIERS
# =========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# =========================
# APP FASTAPI
# =========================

app = FastAPI(title="File Converter API")

# =========================
# CORS (POUR REACT)
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite
        "http://localhost:3000",  # React classique
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# ROUTES
# =========================

@app.get("/")
def root():
    return {"status": "Backend OK"}

# =========================
# ENDPOINT : PDF → DOCX
# =========================

@app.post("/convert/pdf-to-docx")
async def convert_pdf_to_docx(file: UploadFile = File(...)):
    # Vérification du type
    if file.content_type != "application/pdf":
        return JSONResponse(
            status_code=400,
            content={"error": "Le fichier doit être un PDF"}
        )

    # Vérification taille (10 Mo max)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        return JSONResponse(
            status_code=400,
            content={"error": "Le fichier est trop volumineux (max 10 Mo)"}
        )

    # Noms de fichiers temporaires
    input_filename = f"{uuid.uuid4()}.pdf"
    output_filename = f"{uuid.uuid4()}.docx"

    input_path = os.path.join(UPLOAD_DIR, input_filename)
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    # Sauvegarde du PDF
    with open(input_path, "wb") as f:
        f.write(contents)

    # Conversion PDF → DOCX
    try:
        cv = Converter(input_path)
        cv.convert(output_path)
        cv.close()
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Erreur de conversion : {str(e)}"}
        )

    # Renvoi du fichier DOCX
    return FileResponse(
        path=output_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=file.filename.replace(".pdf", ".docx"),
        headers={
            "Content-Disposition": f'attachment; filename="{file.filename.replace(".pdf", ".docx")}"'
        }
    )
