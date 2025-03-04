from fastapi import FastAPI, Form
from fastapi.openapi.utils import get_openapi

app = FastAPI()

@app.post("/execute")
async def execute_powershell(
    code: str = Form(..., title="PowerShell Script", description="Enter your PowerShell script here")
):
    return {"message": "Code received", "code": code}

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="PowerShell Execution API",
        version="1.0.0",
        description="An API to execute PowerShell scripts",
        routes=app.routes,
    )
    
    # Locate the schema definition for `code` and override it as a textarea
    for path in openapi_schema["paths"].values():
        for method in path.values():
            for param in method.get("parameters", []):
                if param.get("name") == "code":
                    param["schema"]["format"] = "textarea"

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi  # Override OpenAPI schema
