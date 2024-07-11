
from flask import Flask, render_template, jsonify, request, redirect, url_for
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from models import db, Event, User
from sqlalchemy.future import select

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///events.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = ' @L#(@$hksdoiI@())'
db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    stmt = select(User).where(User.id == int(user_id))
    result = db.session.execute(stmt)
    return result.scalar_one_or_none()

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    if current_user.is_authenticated:
        return render_template('index.html')
    else:
        return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        if user and user.password == password:
            login_user(user)
            return redirect(url_for('index'))
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        new_user = User(username=username, password=password)
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        return redirect(url_for('index'))
    return render_template('login.html')

@app.route('/events', methods=['GET', 'POST', 'PUT', 'DELETE'])
@login_required
def events_route():
    if request.method == 'POST':
        event_data = request.json
        new_event = Event(title=event_data['title'], start=event_data['start'], end=event_data['end'], user_id=current_user.id)
        db.session.add(new_event)
        db.session.commit()
        return jsonify(new_event.to_dict()), 201

    elif request.method == 'PUT':
        event_data = request.json
        event = Event.query.get(event_data['id'])
        
        if event and event.user_id == current_user.id:
            event.title = event_data['title']
            event.start = event_data['start']
            event.end = event_data['end']
            db.session.commit()
            return jsonify(event.to_dict()), 200
        return jsonify({"error": "해당 이벤트를 찾을 수 없습니다."}), 404

    elif request.method == 'DELETE':
        event_id = request.args.get('id')
        event = Event.query.get(event_id)
        if event and event.user_id == current_user.id:
            db.session.delete(event)
            db.session.commit()
            return jsonify({"message": "해당 일정이 삭제되었습니다."}), 200
        return jsonify({"error": "해당 일정을 찾을 수 없습니다."}), 404

    events = Event.query.filter_by(user_id=current_user.id).all()
    return jsonify([event.to_dict() for event in events])


if __name__ == '__main__':
    with app.app_context():
        events = db.session.query(Event).all() #테스트 데이터 출력
        for event in events:
            print(f"{event.id}: {event.title}, {event.start}, {event.end}, {event.user_id}")

        events = db.session.query(User).all() #유저 테이블 출력
        for event in events:
            print(f"{event.id}: {event.username}, {event.password}, {event.events}")
    app.run(debug = True)