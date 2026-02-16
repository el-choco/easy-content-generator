from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import google.generativeai as genai
import os
from datetime import datetime

# Import our modules
from database import engine, session_local, Base
from models import User, Content

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI
app = FastAPI(title="Easy Content Generator", version="1.0.0")

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
else:
    model = None

# Dependency to get DB session
def get_db():
    db = session_local()
    try:
        yield db
    finally:
        db.close()

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

# Generate content with Gemini
@app.post("/generate")
async def generate_content(
    prompt: str,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Generate content using Gemini AI"""
    if not model:
        raise HTTPException(status_code=500, detail="Gemini API not configured")
    
    try:
        # Generate content using Gemini
        response = model.generate_content(prompt)
        generated_text = response.text
        
        # Save to database if user_id provided
        if user_id:
            content = Content(
                title=prompt[:100],
                body=generated_text,
                owner_id=user_id
            )
            db.add(content)
            db.commit()
            db.refresh(content)
            
            return {
                "id": content.id,
                "prompt": prompt,
                "content": generated_text,
                "created_at": datetime.now().isoformat()
            }
        
        return {
            "prompt": prompt,
            "content": generated_text,
            "created_at": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get content by ID
@app.get("/content/{content_id}")
async def get_content(content_id: int, db: Session = Depends(get_db)):
    """Retrieve content by ID"""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    return {
        "id": content.id,
        "title": content.title,
        "body": content.body,
        "owner_id": content.owner_id
    }

# Get all content
@app.get("/history")
async def get_history(db: Session = Depends(get_db)):
    """Get all generated content"""
    contents = db.query(Content).all()
    return [
        {
            "id": content.id,
            "title": content.title,
            "body": content.body,
            "owner_id": content.owner_id
        }
        for content in contents
    ]

# Delete content
@app.delete("/content/{content_id}")
async def delete_content(content_id: int, db: Session = Depends(get_db)):
    """Delete content by ID"""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    db.delete(content)
    db.commit()
    
    return {"message": "Content deleted successfully"}

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Easy Content Generator",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)