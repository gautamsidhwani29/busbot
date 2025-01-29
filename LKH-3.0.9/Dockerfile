# Use a lightweight Linux image
FROM debian:latest

# Set working directory
WORKDIR /app

# Install required dependencies
RUN apt-get update && apt-get install -y build-essential wget

# Copy the LKH-3 solver source files
COPY ../LKH /app/LKH
COPY ../SRC /app/SRC
COPY ../Makefile /app/

# Compile LKH-3
RUN make

# Copy microservice files
COPY . /app/

# Expose the port the microservice runs on
EXPOSE 5000

# Run the microservice
CMD ["python3", "app.py"]
