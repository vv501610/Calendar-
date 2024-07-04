from flask import Flask, render_template, jsonify, request, redirect, url_for, flash
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, Event, User
from flask_login import current_user
from flask import flash

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///events.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'skkklasdkfjl@dklsadl90312k3mkKDlkd,dsd>>?>S?<D,/.?>@?#>/' #보안키 설정
db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

with app.app_context():
    db.create_all()


@app.route('/')
def index():
    if current_user.is_authenticated:
        return render_template('index.html')
    else:
        return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            login_user(user)
            next_page = request.args.get('next')
            return redirect(next_page or url_for('dashboard'))
        else:
            flash('아이디 또는 비밀번호가 잘못되었습니다.')
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
        user = User.query.filter_by(username=username).first()
        if user:
            flash('해당 아이디는 이미 존재하기에 사용할 수 없습니다.')
        else:
            new_user = User(username = username, password = generate_password_hash(password))
            db.session.add(new_user)
            db.session.commit()
            login_user(new_user)
            return redirect(url_for('index'))
    return render_template('login.html')

@app.route('/events', methods=['GET', 'POST'])
@login_required
def events_route():
    if request.method == 'POST':
        event_data = request.json
        new_event = Event(title=event_data['title'], start=event_data['start'], end=event_data['end'], user_id=current_user.id)
        db.session.add(new_event)
        db.session.commit()
        return jsonify(new_event.to_dict()), 201

    events = Event.query.filter_by(user_id=current_user.id).all()
    return jsonify([event.to_dict() for event in events])

if __name__ == '__main__':
    with app.app_context():
        events = db.session.query(Event).all() #테스트 데이터 출력
        for event in events:
            print(f"{event.id}: {event.title}, {event.start}, {event.end}")
    app.run(debug=True)