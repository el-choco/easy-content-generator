FROM python:3.11-slim

WORKDIR /app

# Copy requirements file from backend directory
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY backend/ .

# Expose the port
EXPOSE 8000

# Run the application using uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]