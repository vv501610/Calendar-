from flask import Flask, render_template, jsonify, request
app = Flask(__name__)

events = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/events', methods=['GET', 'POST'])
def events_route():
    if request.method == 'POST':
        event = request.json
        events.append(event)
        return jsonify(event), 201
    return jsonify(events)

if __name__ == '__main__':
    app.run(debug = True)
