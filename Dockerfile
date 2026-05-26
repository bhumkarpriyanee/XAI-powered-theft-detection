# Dockerfile
# Railway uses this to build and run your FastAPI backend

FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python generate_data.py && python -m backend.ml.train

CMD ["python", "start.py"]
EOF