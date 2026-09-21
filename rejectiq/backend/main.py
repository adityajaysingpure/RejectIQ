from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analyse, history
from core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description=(
        "AI-powered job application rejection analyser. "
        "Paste your resume and a JD — get an ATS score, skill gap report, "
        "and line-by-line rewrite suggestions."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyse.router,  prefix="/api/analyse",  tags=["Analyse"])
app.include_router(history.router,  prefix="/api/history",  tags=["History"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "app": settings.app_name, "version": "1.0.0"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
