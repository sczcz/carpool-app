# Scoutkar

Scoutkar is a web-based application for managing carpool bookings and communication between members of a scout troop.

## Requirements:
Before you begin, make sure you have installed:
 - Python 3.12.x  
 - Node.js 20.10.x

### Step 1: Navigate to the project folder
```bash
cd scoutkar
```

### Step 2: Create a virtual environment
```bash
python -m venv .venv
```

### Step 3: Activate the virtual environment
- Windows:  
  ```bash
  .\.venv\Scripts\activate
  ```
- macOS/Linux:  
  ```bash
  source .venv/bin/activate
  ```

### Step 4: Install backend dependencies
```bash
pip install -r requirements.txt
```

### Step 5: Navigate to the frontend folder
```bash
cd scout-app
```

### Step 6: Install frontend dependencies
```bash
npm install
```

### Step 7: Start the application
```bash
npm run start
```

### Step 8: Open the application
Navigate to `http://localhost:3000` in any web browser.

## API Documentation
To access Swagger UI, start the application using the `swagger-api-docs` branch and go to:  
`http://localhost:5000/api/docs`

## Environment Variables (for deployment only)
Create a `.env` file in the same folder as `app.py` and add values for the following variables:

```
FLASK_SECRET_KEY=
JWT_SECRET_KEY=

DB_USERNAME=
DB_PASSWORD=
DB_HOST=
DB_PORT=
DB_NAME=

MAIL_SERVER=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_USE_TLS=
MAIL_USE_SSL=

ADMIN_EMAIL=
ADMIN_PASSWORD=

# CORS and socketio
CORS_ALLOWED_ORIGINS=
```
