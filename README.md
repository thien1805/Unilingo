# 🎙️ Unilingo - AI-Powered IELTS Speaking Practice Platform

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**Unilingo** is a comprehensive mobile application designed to help users prepare for the IELTS Speaking test. It provides a virtual practice room environment and utilizes a hybrid AI pipeline to deliver highly accurate band scores, detailed feedback, and personalized vocabulary tools.

---

## ✨ Key Features

- **Virtual Practice Room:** Simulates the real IELTS speaking experience for Parts 1, 2, and 3.
- **AI-Powered Evaluation:** Uses a hybrid pipeline (Speech-to-Text + Pronunciation Assessment + LLM Scoring) to provide accurate band scores (Fluency, Lexical, Grammar, Pronunciation).
- **Detailed Feedback:** Generates actionable feedback, strengths, weaknesses, and sample better answers.
- **Smart Vocabulary & Flashcards:** Users can save words from transcripts, and study them using a Spaced Repetition System (SRS).
- **Community Leaderboards:** Real-time ranking to compete with friends and other learners globally.
- **Educational Blog:** Integrated markdown-based blog system for learning materials and tips.

## 🛠 Tech Stack

### Frontend (Mobile App)
- **Framework:** React Native (Expo Bare Workflow) & TypeScript
- **State & Data Management:** Zustand, TanStack Query (React Query)
- **Navigation:** React Navigation v7
- **UI/UX:** React Native Reanimated (for fluid animations), React Native Gesture Handler

### Backend (REST API)
- **Framework:** FastAPI (Python 3.11+)
- **Database & ORM:** PostgreSQL 16, SQLAlchemy 2.0 (Async), Alembic
- **Async Processing:** Redis, Celery (for background AI tasks)
- **Storage:** MinIO / AWS S3 (for audio recordings)
- **AI Services:** 
  - OpenAI Whisper API (Speech-to-Text)
  - Azure Speech Service (Pronunciation assessment)
  - Google Gemini 2.0 API (LLM Scoring & Feedback)
- **Infrastructure:** Docker, Docker Compose

## 🏗 Architecture & Methodology

- **API-First & Decoupled:** Clean separation between the React Native client and FastAPI backend.
- **Asynchronous Processing:** Heavy tasks like audio uploading, AI processing, and LLM inference are offloaded to **Celery** workers backed by **Redis**, ensuring a non-blocking and seamless mobile user experience.
- **Hybrid AI Pipeline:** Instead of relying on a single monolithic LLM, Unilingo orchestrates specialized AI models (Whisper for high-accuracy STT, Azure for granular pronunciation metrics, and Gemini for IELTS rubric-based scoring) to maximize precision and cost-efficiency.
- **Containerization:** The entire backend infrastructure (API, Database, Redis, MinIO) is containerized using Docker Compose for consistent development and deployment.
- **EdTech Algorithms:** Implements Spaced Repetition (SM-2 based) for the flashcard system to optimize vocabulary retention.

## 📂 Project Structure

```text
unilingo_mobile/
├── unilingo_frontend/      # React Native Expo mobile application
├── unilingo-backend/       # FastAPI server, Celery workers, and AI pipelines
├── unilingo-demo/          # Demo or proof-of-concept assets
└── docs/                   # System architecture and implementation documentation
```

## 🚀 Quick Start

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd unilingo-backend
   ```
2. Copy the environment variables template and configure your API keys:
   ```bash
   cp .env.example .env
   ```
3. Start the backend services using Docker Compose:
   ```bash
   docker-compose up -d
   ```
4. Seed the database (optional):
   ```bash
   docker-compose exec api python -m app.seed
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd unilingo_frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npm start
   ```

## 📄 License
This project is for educational and portfolio purposes.
