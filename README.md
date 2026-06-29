# NagrikSetu - AI-Powered Civic Issue Tracker

NagrikSetu is an intelligent civic issue tracking and management platform that connects citizens with local authorities. By leveraging a modern Web Stack and advanced Machine Learning (NLP & Clustering), it automates issue categorization, determines urgency, and prevents duplicate reports.

## 🏗️ Complete Architecture & Workflow

The platform is designed with a microservices-inspired architecture consisting of three main components:

1. **Frontend (User Interface)**
   - Citizens can report civic issues (potholes, garbage, broken streetlights) and upload images.
   - Staff/Authorities can view an interactive dashboard with map visualization, clustered problems, and AI-prioritized tasks.
   - It communicates with the Backend via RESTful APIs.

2. **Backend (Core Server)**
   - Acts as the central orchestrator.
   - Manages Authentication (JWT), Database interactions (MongoDB), and file uploads.
   - When a new issue is reported, the backend makes an HTTP request to the **ML Service** to analyze the title, description, and location.
   - Handles advanced features like Excel report generation and status tracking.

3. **ML Service (AI Intelligence Engine)**
   - A dedicated Python FastAPI microservice that processes text and coordinates.
   - Enhances incoming reports with AI-generated metadata before they are saved to the database.

## 🧠 Machine Learning Implementation Details

The ML Service is built using `FastAPI` and state-of-the-art AI libraries. It performs three primary functions:

1. **Smart Categorization (NLP)**
   - **How it works:** Uses Hugging Face's `transformers` library with a Zero-Shot Classification model (`facebook/bart-large-mnli`). 
   - **Why it matters:** It automatically understands the context of a user's description (e.g., "water is leaking everywhere") and assigns it to predefined categories like `Water`, `Roads`, or `Electricity` without needing manual tagging.

2. **Urgency & Severity Detection**
   - **How it works:** Scans the text for critical keywords and phrases (e.g., "dangerous", "explosion", "minor") and assigns a priority score (Critical, High, Medium, Low).
   - **Why it matters:** Allows authorities to immediately see life-threatening or severe infrastructure issues at the top of their dashboard.

3. **Spatial Clustering (Duplicate Detection)**
   - **How it works:** Uses the `scikit-learn` library's **DBSCAN** (Density-Based Spatial Clustering of Applications with Noise) algorithm.
   - **Why it matters:** If 10 citizens report the same broken streetlight at the same location, DBSCAN groups these geographical coordinates into a single "Cluster". The backend merges them to prevent spam and updates the urgency score based on report frequency.

---

## 🛠️ Complete Tech Stack

### Frontend
* **Core:** React 18, TypeScript, Vite
* **Styling:** TailwindCSS, Framer Motion (animations)
* **Maps:** Mapbox / MapLibre (Interactive geospatial visualization)
* **Localization:** i18next (Multi-language support)

### Backend
* **Core:** Node.js, Express.js
* **Database:** MongoDB (with Mongoose ODM)
* **Security:** JWT Authentication, bcrypt (password hashing)
* **Utilities:** exceljs (Excel reporting), Multer (file handling)

### ML Service
* **Core:** Python, FastAPI, Uvicorn
* **AI/ML Libraries:** `transformers` (Hugging Face), `torch` (PyTorch), `scikit-learn`, `numpy`, `pandas`

---

## 🚀 How to Start the Project (3 Terminals)

To run the complete application locally, you will need to open **3 separate terminal windows** and run each service simultaneously.

### Terminal 1: Backend Service
The central server that connects to MongoDB and serves the core API.
```bash
# 1. Navigate to the backend folder
cd backend

# 2. Install dependencies (only needed once)
npm install

# 3. Start the server (uses nodemon for auto-restarts)
npm run dev
```
*Expected Output: `Server running on port 5000` & `Connected to MongoDB`*

### Terminal 2: ML Service
The Python AI engine for categorization and clustering.
```bash
# 1. Navigate to the ml-service folder
cd ml-service

# 2. Create a virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate      # On Windows

# 3. Install dependencies (only needed once)
pip install -r requirements.txt

# 4. Start the FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Expected Output: `Uvicorn running on http://0.0.0.0:8000`*

### Terminal 3: Frontend Web App
The React user interface.
```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Install dependencies (only needed once)
npm install

# 3. Start the Vite development server
npm run dev
```
*Expected Output: `Vite running at http://localhost:5173`*

---

## 🔑 Authority Access

To register as a Staff/Authority member and view the administrative dashboard (including the Export capabilities), you will need the admin key during Sign Up:
**Admin Key:** `CIVIC_ADMIN_2026`
