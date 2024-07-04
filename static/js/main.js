document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: function(fetchInfo, successCallback, failureCallback) {
            fetch('/events')
                .then(response => response.json())
                .then(data => {
                    calendar.removeAllEvents();
                    successCallback(data);
                })
                .catch(error => {
                    failureCallback(error);
                });
        },
        eventDidMount: function(info) {
            var eventDate = new Date(info.event.start);
            var today = new Date();
            today.setHours(0, 0, 0, 0);  // 오늘 날짜의 시간 부분을 0으로 설정
            var diffTime = eventDate.getTime() - today.getTime();
            var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                // 이미 지난 일정
                info.el.style.backgroundColor = 'black';
                info.el.style.borderColor = 'black';
            } else if (diffDays === 0) {
                // 당일 일정
                info.el.style.backgroundColor = 'red';
                info.el.style.borderColor = 'red';
            } else {
                // 다가올 일정
                var redComponent = Math.min(255, 255 - diffDays * 10);
                var blueComponent = Math.min(255, diffDays * 10);
                var color = `rgb(${redComponent}, 0, ${blueComponent})`;
                info.el.style.backgroundColor = color;
                info.el.style.borderColor = color;
            }
        },
        selectable: true,
        select: function(info) {
            var title = prompt('이벤트 제목:');
            if (title) {
                var event = {
                    title: title,
                    start: info.startStr,
                    end: info.endStr
                };
                fetch('/events', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrf_token')  // CSRF 토큰 추가
                    },
                    body: JSON.stringify(event)
                })
                .then(response => response.json())
                .then(data => {
                    calendar.addEvent(data);
                });
            }
            calendar.unselect();
        }
    });
    calendar.render();
});

// CSRF 토큰을 가져오는 함수
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}