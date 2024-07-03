from flask import Flask, render_template, jsonify, request
from models import db, Event

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///events.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/events', methods=['GET', 'POST'])
def events_route():
    if request.method == 'POST':
        event_data = request.json
        new_event = Event(title=event_data['title'], start=event_data['start'], end=event_data['end'])
        db.session.add(new_event)
        db.session.commit()
        return jsonify(new_event.to_dict()), 201

    events = Event.query.all()
    return jsonify([event.to_dict() for event in events])

if __name__ == '__main__':
    app.run(debug=True)
