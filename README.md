# Scoutkar

Scoutkar är en webbaserad applikation för att hantera bokningar av samåkning och kommunikation mellan medlemmar i en scoutkår.

## Installation och start

Följ dessa steg för att installera och starta projektet på din lokala maskin.

### Steg 1: Navigera till projektmappen
cd scoutkar

### Steg 2: Skapa en virtuell miljö
python -m venv .venv

### Steg 3: Aktivera den virtuella miljön
windows:    .\.venv\Scripts\activate
mac:        source .venv/bin/activate

### Steg 4: Installera beroenden
pip install -r requirements.txt

### Steg 5: Kör applikationen
python app.py

### Steg 6: Öppna applikationen i webbläsaren
http://127.0.0.1:5000/

### Krav:
Python 3.x
Flask och andra beroenden (installeras via requirements.txt)