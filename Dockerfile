cat > Dockerfile << 'DONE'
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python generate_data.py && python -m backend.ml.train
CMD ["python", "start.py"]
DONE