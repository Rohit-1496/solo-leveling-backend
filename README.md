# 🗡️ Solo Leveling System V2

> "The System is evolution. Become the Shadow Monarch."

A high-performance RPG productivity dashboard built with **FastAPI**, **Next.js**, and **PostgreSQL**. This system transforms your daily tasks into a "Quest" loop, featuring leveling, XP, HP penalties for missed habits, and a high-stakes "Secret Penalty Quest" recovery protocol.

---

## 💎 Elite Tech Stack

-   **Frontend**: Next.js 15 (App Router), Tailwind CSS (Aura Visuals), Framer Motion (Animations), Lucide React.
-   **Backend**: FastAPI (Python), SQLAlchemy 2.0 (Async), Pydantic.
-   **Database**: PostgreSQL (Neon DB).
-   **Execution**: Gunicorn with Uvicorn workers.

---

## 🚀 Cloud Deployment (Production Guide)

### 1. Database: Neon DB (PostgreSQL)
1. Create a project on [Neon.tech](https://neon.tech).
2. Copy your **Connection String**.
3. **CRITICAL**: Prefix it with `postgresql+asyncpg://` (not `postgresql://`).
4. **Example**: `postgresql+asyncpg://neondb_owner:secret@ep-dark-haze.us-east-1.aws.neon.tech/neondb?sslmode=require`

### 2. Backend: Render.com (FastAPI)
1. Connect your GitHub repo to **Render Web Service**.
2. **Build Command**: `pip install -r requirements.txt`
3. **Start Command**: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app`
4. **Env Var**: Add `DATABASE_URL` with your Neon string.

### 3. Frontend: Netlify (Next.js)
1. Connect your GitHub repo to **Netlify Site**.
2. **Build Command**: `npm run build`
3. **Publish Directory**: `frontend/out`
4. **Env Var**: Add `NEXT_PUBLIC_API_URL` with your live Render URL (e.g., `https://solo-leveling-api.onrender.com`).

---

## 🛠️ Local Development

1. **Backend**:
    ```bash
    pip install -r requirements.txt
    python -m uvicorn app.main:app --reload
    ```
2. **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

## 📜 License
Provided under the **MIT License**. See [LICENSE](LICENSE) for details.

---

**Hunter, the system is yours. Do not falter.** 🗡️
