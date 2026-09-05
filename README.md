# DocuConvert — Render-ready

This version is configured for Render Web Services.

## Deploy on Render

1. Put this project in a GitHub repository.
2. In Render, choose **New → Web Service** and connect the repository.
3. Select **Python 3** and the **Free** plan.
4. If Render does not automatically use `render.yaml`, set:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app --workers 1 --timeout 120`
5. Deploy.

The repository contains:
- `.python-version` → Python 3.13
- `render.yaml` → Render Blueprint configuration
- `requirements.txt` → Gunicorn + conversion dependencies

## Conversion features

- PDF → Word: `pdf2docx`
- PDF → Excel: `pdfplumber` + `openpyxl`
- Word → PDF: optional LibreOffice endpoint

### Important Render limitation

The free service uses an ephemeral filesystem, so uploaded/generated files should be treated as temporary. This app deletes conversion files after the response.

PDF → Excel works best with text-based PDFs containing recognizable tables. Scanned PDFs need OCR, which can be added later.

For a larger production service, add rate limiting, malware scanning, background jobs, persistent/object storage, monitoring, and stronger file validation.
