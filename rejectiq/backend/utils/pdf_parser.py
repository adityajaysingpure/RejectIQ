import io
import PyPDF2
from fastapi import UploadFile, HTTPException


async def extract_text_from_pdf(file: UploadFile) -> str:
    """
    Extract plain text from an uploaded PDF file.
    Raises HTTPException if the file is not a valid PDF
    or if no extractable text is found (e.g. scanned image PDF).
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted for resume upload."
        )

    raw_bytes = await file.read()

    try:
        reader = PyPDF2.PdfReader(io.BytesIO(raw_bytes))
    except Exception:
        raise HTTPException(
            status_code=422,
            detail="Could not read the PDF. Make sure the file is not corrupted."
        )

    pages_text: list[str] = []
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            pages_text.append(extracted.strip())

    full_text = "\n\n".join(pages_text).strip()

    if not full_text:
        raise HTTPException(
            status_code=422,
            detail=(
                "No text could be extracted from this PDF. "
                "It may be a scanned image. Please use a text-based PDF."
            ),
        )

    return full_text


def clean_text(text: str) -> str:
    """Remove excessive whitespace and normalise line breaks."""
    import re
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()
