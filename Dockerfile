# Builder stage
FROM rust:1.80-slim as builder

# Install build dependencies
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY . .

# Build the backend
WORKDIR /usr/src/app/backend
RUN cargo build --release

# Runner stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy the binary from the builder stage
COPY --from=builder /usr/src/app/backend/target/release/backend /usr/local/bin/backend

# Expose the API port
EXPOSE 3000

# Set the environment variable for the port (Render uses this)
ENV PORT=3000

# Run the backend
CMD ["backend"]
