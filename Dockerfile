#---------------------------------------------------
#Dockerfile for Fragments Microservice
#
#This file contains instructions to buid a Docker image for this microservice. It includes:
#   - Node.js runtime
#   - Project dependencies
#   - Application source code
#   - Configuration for running the server
#
# This image can then be used to run a Docker container that executes
# the fragments microservice in an isolated environment.
#---------------------------------------------------

# Use a specific Node.js version to match local development environment
# (Run `node --version` locally to confirm your version)
FROM node:22.12.0

# -----------------------------------------------------------------------------
# Image metadata
# -----------------------------------------------------------------------------
LABEL maintainer="Aung Moe Thwe <amthwe@myseneca.com>"
LABEL description="Fragments Node.js Microservice - Dockerized version"

# -----------------------------------------------------------------------------
# Environment variables
# -----------------------------------------------------------------------------

# Default port the service runs on inside the container
ENV PORT=8080

# Reduce npm logging noise during Docker builds
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colored output in npm (cleaner Docker logs)
ENV NPM_CONFIG_COLOR=false

# -----------------------------------------------------------------------------
# Set working directory
# -----------------------------------------------------------------------------

# Create and use /app as working directory inside the container
WORKDIR /app

# -----------------------------------------------------------------------------
# Install dependencies
# -----------------------------------------------------------------------------

# Copy only package.json and package-lock.json first
# This allows Docker to cache npm install layer if dependencies don't change
COPY package*.json ./

# Install dependencies defined in package-lock.json
RUN npm install

# -----------------------------------------------------------------------------
# Copy application source code
# -----------------------------------------------------------------------------

# Copy source code into the container
COPY ./src ./src

# If using Basic Auth for testing, include the .htpasswd file
# (Make sure .dockerignore allows this file!)
COPY ./tests/.htpasswd ./tests/.htpasswd

# -----------------------------------------------------------------------------
# Expose port
# -----------------------------------------------------------------------------

# This documents that the container listens on port 8080
EXPOSE 8080

# Start the container by running our server
CMD npm start
