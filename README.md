# Scoutkar

Scoutkar är en webbaserad applikation för att hantera bokningar av samåkning och kommunikation mellan medlemmar i en scoutkår.

## Krav:
Python 3.12.x
Node.js 20.10.x

Innan du börjar säkerställ att du har installerat:
 - Python 3.12.x
 - Node.js 20.10.x

### Steg 1: Navigera till projektmappen
cd scoutkar

### Steg 2: Skapa en virtuell miljö
python -m venv .venv

### Steg 3: Aktivera den virtuella miljön
windows:    .\.venv\Scripts\activate
mac:        source .venv/bin/activate

### Steg 4: Installera beroenden
pip install -r requirements.txt

### Steg 5: Navigera till frontend-mappen
cd scout-app

### Steg 6: Installera beroenden för frontend
npm install

### Steg 7: Starta applikationen
npm run start

### Steg 8: Öppna applikationen
Navigera till http://localhost:3000 i valfri webb-läsare

### Krav:
Python 3.x
Flask och andra beroenden (installeras via requirements.txt)

## API-dokumentation
För åtkomst till Swagger UI starta applikationen i branchen "swagger-api-docs" och navigera till http://localhost:5000/api/docs

## Miljövariabler (endast för deployment)
Skapa en .env fil i samma mapp som app.py och lägg till värden på följande variabler:


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

#CORS and socketio
CORS_ALLOWED_ORIGINS=