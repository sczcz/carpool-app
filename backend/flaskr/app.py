from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Route för att rendera index.html
@app.route('/')
def index():
    return render_template('index.html')

# Route för att ta emot JSON från klienten (POST)
@app.route('/api/data', methods=['POST'])
def receive_data():
    data = request.get_json()  # Hämta JSON-data från förfrågan
    message = data.get('message', 'Ingen meddelande mottaget')
    response = {"response_message": f"Du skickade: {message}"}
    
    return jsonify(response), 200  # Returnera JSON-data och en statuskod

# Route för att skicka JSON-data till klienten (GET)
@app.route('/api/give-data', methods=['GET'])
def send_data():
    data = {
        "name": "Scout App",
        "version": "1.0",
        "description": "Ett API för att hantera bokningar och meddelanden"
    }
    
    return jsonify(data), 200  # Returnera JSON och en statuskod

if __name__ == '__main__':
    app.run(debug=True)
