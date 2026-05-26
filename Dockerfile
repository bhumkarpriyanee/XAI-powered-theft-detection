# Dockerfile
# Railway uses this to build and run your FastAPI backend

FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy requirements first (so Docker caches this layer)
COPY requirements.txt .

# Install all Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy your entire project into the container
COPY . .

# Train the model if model.pkl doesn't exist or is empty
# This runs once during build
RUN python generate_data.py && python -m backend.ml.train

# Tell Railway which port to expose
EXPOSE 8000

# Start the FastAPI server
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
