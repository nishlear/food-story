FROM python:3.12-slim

WORKDIR /app

# Install dependencies for building and running
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/

# Expose the application port
EXPOSE 7330

# Generate self-signed certificate if not present, then start the application
CMD ["/bin/sh", "-c", "if [ ! -f cert.pem ]; then openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365 -subj '/C=US/ST=State/L=City/O=Org/CN=localhost'; fi && python src/geolocation.py"]
