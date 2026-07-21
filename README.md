# 🌉 NagrikSetu (CivicConnect) - AI-Powered Civic Issue Tracking & RAG AI Platform

**NagrikSetu** is an enterprise-grade, multi-service civic issue tracking and management platform designed to seamlessly connect citizens directly with local municipal authorities. By fusing modern web architecture with advanced Machine Learning (Computer Vision, Spatial DBSCAN Clustering, Dynamic Urgency Scoring) and a Retrieval-Augmented Generation (RAG) AI Chatbot ("Setu"), NagrikSetu automates issue verification, prevents duplicate reporting, prioritizes critical infrastructure failures, and provides real-time geospatial analytics.

---

## 🏗️ Complete Microservice Architecture

NagrikSetu operates on a decoupled, 4-tier microservice architecture:

```
                               ┌─────────────────────────────────────────┐
                               │       Frontend Web Application          │
                               │   (React 19 + TypeScript + Vite)        │
                               │   Citizen Portal & Staff Dashboard      │
                               └────────────────────┬────────────────────┘
                                                    │
                                      HTTP REST APIs / JSON / Multipart
                                                    │
            ┌───────────────────────────────────────┼───────────────────────────────────────┐
            ▼                                       ▼                                       ▼
┌───────────────────────────┐           ┌───────────────────────────┐           ┌───────────────────────────┐
│    Backend Core Server    │           │    ML Intelligence Engine  │           │   RAG Chatbot Service     │
│   (Node.js / Express.js)  │──────────►│      (Python FastAPI)     │           │   (Node.js / LangChain)   │
└─────────────┬─────────────┘           └───────────────────────────┘           └─────────────┬─────────────┘
              │                                                                               │
   ┌──────────┴──────────┐                                                         ┌──────────┴──────────┐
   ▼                     ▼                                                         ▼                     ▼
┌──────────────┐  ┌──────────────┐                                            ┌──────────────┐  ┌──────────────┐
│ MongoDB      │  │ Roboflow CV  │                                            │ Pinecone     │  │ Groq LLM     │
│ Atlas        │  │ & Nominatim  │                                            │ Vector DB    │  │ (Llama 3.1)  │
│ (2dsphere)   │  │ APIs         │                                            │ (Embeddings) │  │              │
└──────────────┘  └──────────────┘                                            └──────────────┘  └──────────────┘
```

---

## 🛠️ Comprehensive Tech Stack Matrix

| Layer / Domain | Technology / Library | Version / Model | Specific Role & Functionality |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | 19.2.5 | Modern declarative UI component hierarchy |
| **Frontend Language** | TypeScript | ~5.8.2 | End-to-end type safety for models & components |
| **Frontend Build Tool**| Vite | ^5.4.11 | Lightning-fast HMR and production bundle optimization |
| **Styling & Design** | Tailwind CSS | ^4.1.14 | Utility-first responsive glassmorphism & dark UI styling |
| **Animations** | Motion (Framer) | ^12.23.24 | Smooth UI modal slide-ins, micro-interactions, spring physics |
| **Geospatial Maps** | Leaflet & React-Leaflet| ^1.9.4 / ^5.0.0 | Interactive map rendering, marker popups, openstreetmaps |
| **Localization (i18n)**| i18next & react-i18next | ^26.0.6 | Multi-lingual support (English, Hindi, Marathi, etc.) |
| **Icons** | Lucide React | ^0.546.0 | Vector icon sets for civic categories and UI metrics |
| **Backend Runtime** | Node.js / Express.js | ^4.21.2 | Central API orchestrator, HTTP middleware, auth enforcement |
| **Database** | MongoDB Atlas / Mongoose | ^8.0.0+ | Cloud NoSQL DB with Mongoose ODM & `2dsphere` spatial indexing |
| **Authentication** | JWT (JsonWebToken) & bcrypt | ^9.0.0 | Stateless bearer token auth & password hashing |
| **File Handling** | Multer | ^1.4.5 | In-memory multipart buffer processing for uploaded hazard photos |
| **Report Generation** | ExcelJS | ^4.4.0 | Server-side `.xlsx` spreadsheet creation with filtered export |
| **Geocoding API** | OpenStreetMap Nominatim | REST | Text address resolution to GeoJSON `[longitude, latitude]` points |
| **Computer Vision** | Roboflow Serverless | `civic-issues-qj5pb/2` | Image classification model as primary source of truth for categories |
| **ML Framework** | Python / FastAPI | 3.10+ / ^0.115.0 | High-performance ASGI microservice for NLP & clustering |
| **Clustering ML** | Scikit-Learn (DBSCAN) | ^1.3.2 | Spatial Haversine distance clustering for duplicate detection |
| **NLP Engine** | Keyword Regex + BART | Custom / HF | Contextual category & severity detection engine |
| **LLM Engine** | Groq (`@langchain/groq`) | `llama-3.1-8b-instant` | Ultra-fast RAG generative AI response engine |
| **Vector Database** | Pinecone | ^2.2.1 | High-dimensional cloud vector database for context retrieval |
| **Embeddings API** | Hugging Face Inference | `all-MiniLM-L6-v2` | 384-dimensional dense text vector embeddings |
| **PDF Ingestion** | pdf-parse | ^1.1.1 | Extraction of text from civic policy PDFs into vector chunks |

---

## 🤖 Deep-Dive: Machine Learning & AI Implementations

### 1. Computer Vision Image Classification (Roboflow)
* **File:** `backend/services/mlService.js` -> `classifyImage()`
* **API Endpoint:** `https://detect.roboflow.com/civic-issues-qj5pb/2`
* **Mechanism:** When a citizen uploads an image with a report, the backend buffers the image memory via Multer and posts the base64 string directly to Roboflow's serverless CV model.
* **Source of Truth Rule:** The CV prediction **overrides user-selected dropdowns**. If an issue image is classified as a pothole with high confidence, the category is explicitly set to the AI result, and `aiTags` are populated with `[Category, Confidence %, Severity]`.

### 2. Spatial Duplicate Detection (Scikit-Learn DBSCAN)
* **File:** `ml-service/app/models/clustering.py` -> `DuplicateDetector`
* **Algorithm:** **DBSCAN** (Density-Based Spatial Clustering of Applications with Noise)
* **Distance Metric:** **Haversine Formula** (`eps_km = 0.5km`, Earth Radius $R = 6371\text{ km}$)
* **Mechanism:** Computes pairwise spherical distances between incoming coordinate pairs `(lat, lng)`. If a new report falls within 500 meters of an existing active ticket, it flags a duplicate warning, links `duplicateOf` IDs, and groups tickets into a unified `clusterId`.

### 3. Weighted Dynamic Urgency Scorer
* **File:** `ml-service/app/models/scoring.py` -> `DynamicScorer`
* **Formula:** Computes a normalized 0–100 urgency score using a multi-factor weighted equation:
$$\text{Urgency Score} = 0.35(P) + 0.25(U) + 0.20(A) + 0.15(C) + 0.05(S)$$
  * **$P$ (Priority Score):** Critical = 100, High = 75, Medium = 50, Low = 25
  * **$U$ (Upvote Score):** Normalized upvotes ($\min(\text{upvotes} \times 5, 100)$)
  * **$A$ (Age Score):** Days elapsed ($\min(\text{days} \times 10, 100)$)
  * **$C$ (Cluster Size):** Duplicate count ($\min(\text{cluster\_size} \times 15, 100)$)
  * **$S$ (Status Score):** Pending = 100, In Progress = 60, Resolved/Rejected = 0
* **Levels:** `Immediate` ($\ge 80$), `High` ($\ge 60$), `Medium` (`40–59`), `Low` ($< 40$).

### 4. Text-to-Location Automatic Geocoding
* **File:** `backend/services/geoService.js` -> `geocodeAddress()`
* **API:** OpenStreetMap Nominatim API (`https://nominatim.openstreetmap.org/search`)
* **Mechanism:** Converts raw user location strings (e.g. *"Sangli Station Road"*) into GeoJSON Point format (`{ type: 'Point', coordinates: [longitude, latitude] }`).
* **MongoDB Spatial Indexing:** Saved with `hazardSchema.index({ locationGeo: '2dsphere' })` to support 2D sphere spatial queries.

### 5. RAG AI Chatbot Pipeline ("Setu")
* **Files:** `chatbot-service/server.js`, `chatbot-service/engine.js`
* **Pipeline:**
  1. **Ingestion (`POST /api/chatbot/ingest`):** Admin uploads municipal handbook PDFs -> `pdf-parse` extracts raw text -> Text chunked into 1000-character windows with 200-character overlap -> HuggingFace `all-MiniLM-L6-v2` converts chunks into 384-dimensional dense vectors -> Upserted to Pinecone.
  2. **Querying (`POST /api/chatbot/query`):** User question converted into 384-dim vector -> Pinecone queries Top-3 cosine-similarity matching contexts -> Augmented system prompt constructed -> Sent to Groq `llama-3.1-8b-instant` -> Plain text response returned.

---

## 🗄️ Database Schemas & Data Models

### Hazard Model (`backend/models/Hazard.js`)
```javascript
{
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'Unclassified' },       // AI Source of Truth Category
  userCategory: { type: String, default: '' },              // Audit trail of dropdown choice
  aiTags: [{ type: String }],                               // AI Badges & Labels
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'], default: 'Pending' },
  location: { type: String, default: '' },
  locationName: { type: String, default: '' },              // Raw user text location
  locationGeo: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }         // [longitude, latitude] GeoJSON
  },
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 },
  imageUrl: { type: String, default: '' },
  reportedBy: { type: String, required: true },
  reportedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: String }],
  updates: [{
    status: String,
    comment: String,
    updatedBy: String,
    imageUrl: String,
    createdAt: Date
  }],
  assignedTo: { type: String, default: '' },
  expectedResolutionDate: { type: String, default: '' },
  
  // ML Fields
  mlCategory: { type: String, default: '' },
  mlPriority: { type: String, default: '' },
  mlConfidence: { type: Number, default: 0 },
  urgencyScore: { type: Number, default: 0 },
  clusterSize: { type: Number, default: 0 },
  clusterId: { type: String, default: '' },
  duplicateOf: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hazard' }]
}
// Index: hazardSchema.index({ locationGeo: '2dsphere' });
```

---

## 📡 Complete REST API Route Documentation

### 🔐 1. Authentication Service (`/api/auth`)
* `POST /api/auth/register` - Register new user/staff (`{ name, email, password, role, adminKey? }`)
* `POST /api/auth/login` - Authenticate user & return JWT token (`{ email, password }`)
* `GET  /api/auth/me` - Fetch authenticated user session profile (Header: `Authorization: Bearer <token>`)

### ⚠️ 2. Hazard Data Service (`/api/data`)
* `POST /api/data` - Submit hazard report (Supports `multipart/form-data` with `image` buffer, `title`, `description`, `category`, `location`, `lat`, `lng`).
* `POST /api/data/analyze` - Proxy endpoint for ML text categorization & priority inference.
* `GET  /api/data` - Get reports submitted by the logged-in user.
* `GET  /api/data/all` - Get all public hazard reports.
* `PUT  /api/data/:id/status` - Update ticket status & append official comments (`{ status, comment }`).
* `PUT  /api/data/:id/upvote` - Toggle citizen upvote.
* `DELETE /api/data/:id` - Delete hazard report.

### 📊 3. Export Service (`/api/export`)
* `GET  /api/export/excel` - Stream full hazard database as styled `.xlsx` file.
* `POST /api/export/excel/filtered` - Stream custom filtered hazards (by category, status, priority, date range) as `.xlsx`.

### 🤖 4. Chatbot Service (`/api/chatbot`)
* `POST /api/chatbot/query` - Send user prompt to RAG AI chatbot (`{ message: "..." }`).
* `POST /api/chatbot/ingest` - Upload municipal handbook PDF file (`multipart/form-data` under key `file`).

### 🐍 5. ML Microservice (`/api/ml`)
* `POST /api/ml/categorize/analyze` - Perform zero-shot text classification.
* `POST /api/ml/cluster/detect-duplicates` - Run DBSCAN distance comparison against existing tickets.
* `POST /api/ml/priority/calculate-urgency` - Run dynamic urgency scoring formula.
* `POST /api/ml/priority/rank-issues` - Rank array of issues by urgency.

---

## 🔄 End-to-End Core Workflows

### 1. Hazard Submission Pipeline
```
[User submits Form] 
       │
       ├──► (If Image attached) ──► Node Buffer ──► Roboflow CV API ──► Category Override & aiTags
       │
       ├──► (If Address text given) ──► Nominatim Geocoding API ──► GeoJSON Point [lng, lat]
       │
       ├──► (Coordinates check) ──► FastAPI DBSCAN ──► Flag duplicates & link clusterId
       │
       └──► Saved to MongoDB Atlas (2dsphere index) ──► Broadcast to Map & Dashboard
```

### 2. RAG Chatbot Q&A Pipeline
```
[Citizen Question] ──► HuggingFace API ──► 384-dim Vector ──► Pinecone Vector Index
                                                                       │
                                                            Retrieve Top-3 Contexts
                                                                       │
[Plain Text Answer] ◄── Groq Llama 3.1 LLM ◄── Context-Augmented Prompt ┘
```

---

## 🚀 How to Run the Ecosystem (4 Terminals)

### 1️⃣ Terminal 1: Backend Server
```bash
cd backend
npm install
npm run dev
```
*Runs on `http://localhost:5000`*

### 2️⃣ Terminal 2: ML Python Service
```bash
cd ml-service
python -m venv venv
venv\Scripts\activate      # On Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Runs on `http://localhost:8000`*

### 3️⃣ Terminal 3: Chatbot Service
```bash
cd chatbot-service
npm install
node server.js
```
*Runs on `http://localhost:5001`*

### 4️⃣ Terminal 4: Frontend Web App
```bash
cd frontend
npm install
npm run dev
```
*Runs on `http://localhost:3000` or `http://localhost:5173`*

---

## 🔑 Authority Access Key

To register as a **Staff / Municipal Authority** account and unlock administrative privileges (Status Management, Emergency Priority Overrides, Map Cluster Analytics, and Filtered Excel Exports), enter the admin key during registration:

> **Admin Key:** `CIVIC_ADMIN_2026`
