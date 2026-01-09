# Fragments Backend API

This repository contains the backend REST API for the **Fragments** service.  
The project is built using **Node.js** and **Express**, with structured logging, linting, and debugging configured for development and future labs.

This repository will be used throughout the term for all backend-related labs and assignments.

---

## Author

**Name:** Aung Moe Thwe  
**GitHub:** https://github.com/AungMoeThwe 

---

## Description

The Fragments backend is a Node.js microservice that exposes a REST API.  
At this stage, the service provides a **health check endpoint** to verify that the server is running correctly.

The project includes:

- Express-based API server
- Structured JSON logging using Pino
- ESLint for static code analysis
- Prettier for consistent code formatting
- Environment-based configuration
- Development, production, and debugging scripts
- VSCode debugger integration

---

## Prerequisites

Make sure the following are installed and working:

- **Node.js (LTS version)**
- **npm**
- **git**
- **VSCode**
  - ESLint extension
  - Prettier – Code Formatter extension
- **curl** (use `curl.exe` on Windows PowerShell)
- **jq** (for JSON formatting)

---

## Installation

Clone the repository and install dependencies:

```bash
git clone git@github.com:AungMoeThwe/fragments.git

cd fragments

npm install
```
---

## Project Structure

```text
fragments/
├── src/
│   ├── app.js        # Express app and routes
│   ├── server.js     # Server startup and shutdown logic
│   └── logger.js     # Pino logger configuration
├── .vscode/
│   ├── settings.json 
│   └── launch.json
├── .env.debug
├── eslint.config.mjs
├── package.json
├── package-lock.json
└── README.md 
```

---

## Available Scripts
The following npm scripts are available for development and testing:

### Lint
Runs ESLint on all source files to check for syntax and code quality issues.
```bash
npm run lint
```

### Production Mode
Once the dependencies are installed, the following methods can be used to start the server normally on port 8080
```bash
npm start
```
### Development Mode
Runs the server in watch mode and automatically restarts when files change. Uses the .env.debug configuration.
```bash
npm run dev
```
### Debug Mode
Starts the server in watch mode with the Node.js inspector enabled.
This allows attaching the VSCode debugger.
```bash
npm run debug
```

---

## Debugging with VSCode

This project includes a VSCode debug configuration that allows pausing execution and inspecting the server at runtime.

### Steps to Debug

1. Open the project folder in VSCode
2. Set a breakpoint in `src/app.js` inside the health check route
3. Open the **Run and Debug** panel in VSCode
4. Select **"Debug via npm run debug"**
5. Start debugging
6. Access the server using a browser or curl:
```bash
curl http://localhost:8080
```
Below is an example response if everything goes well
```json
{
  "status":"ok",
  "description":"fragments service running normally",
  "author":"Aung Moe Thwe",
  "githubUrl":"https://github.com/AungMoeThwe/fragments",
  "version":"0.0.1",
  "timestamp":"2026-01-09T18:18:21.291Z"
}
```

---

## License

UNLICENSED — this repository contains private, course-related code.
