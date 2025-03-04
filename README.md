from fastapi import FastAPI, Form
from fastapi.openapi.docs import get_swagger_ui_html

app = FastAPI()

@app.post("/execute")
async def execute_powershell(
    code: str = Form(..., title="PowerShell Script", description="Enter your PowerShell script here")
):
    return {"message": "Code received", "code": code}

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui():
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="FastAPI - PowerShell Execution",
        swagger_favicon_url=None,
        swagger_ui_parameters={
            "dom_id": "#swagger-ui",
            "syntaxHighlight.theme": "monokai"  # Optional, makes code look better
        }
    ) + """
    <style>
        textarea { 
            min-height: 200px !important; 
            resize: both !important;
            white-space: pre-wrap !important;
            font-family: monospace;
        }
    </style>
    """

