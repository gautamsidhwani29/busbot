# Use a lightweight Linux image
FROM debian:latest

# Set working directory
WORKDIR /app

# Install required dependencies
RUN apt-get update && apt-get install -y build-essential wget gcc g++ make

# Copy the LKH-3 solver source files
COPY LKH /app/LKH
COPY SRC /app/SRC
COPY Makefile /app/

# Ensure LTO is disabled (or recompile with proper flags)
RUN make CFLAGS="-O2 -fno-lto"

# Copy microservice files
COPY lkh-microservice /app/lkh-microservice

# Expose the port the microservice runs on
EXPOSE 5000

# Run the microservice
CMD ["python3", "app.py"]
