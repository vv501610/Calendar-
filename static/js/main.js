document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var holidays = []; // 공휴일 추가
    var calendar = new FullCalendar.Calendar(calendarEl, {
        googleCalendarApiKey: "AIzaSyDJMW46KlS9mjPYpcUn5dbudBk2TDtXrQo",  // 구글 api키
        initialView: 'dayGridMonth',
        locale: 'ko',  // 한국어로 설정
        events: async function(fetchInfo, successCallback, failureCallback) {
            try {
                // 일반 이벤트 불러오기
                const response = await fetch('/events');
                const data = await response.json();
                // 공휴일 데이터 가져오기
                const holidayResponse = await fetch(
                    `https://www.googleapis.com/calendar/v3/calendars/ko.south_korea%23holiday%40group.v.calendar.google.com/events?key=${calendar.getOption('googleCalendarApiKey')}`
                );
                const holidayData = await holidayResponse.json();
                const holidays = holidayData.items.map(event => ({
                    title: event.summary,
                    start: event.start.date || event.start.dateTime,
                    end: event.end.date || event.end.dateTime,
                    backgroundColor: 'red',
                    className: 'holiday'
                }));

                // 기존 이벤트에 공휴일 이벤트를 추가
                const allEvents = data.concat(holidays);
                calendar.removeAllEvents();
                successCallback(allEvents);
            } catch (error) {
                failureCallback(error);
            }
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
            var title = prompt('일정:');
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
        },
        eventClick: function(info) {
            var eventObj = info.event;
            var editTitle = prompt('일정 수정:', eventObj.title);
            if (editTitle !== null) {
                eventObj.setProp('title', editTitle);
                var event = {
                    id: eventObj.id,
                    title: editTitle,
                    start: eventObj.startStr,
                    end: eventObj.endStr
                };
                fetch(`/events/${event.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrf_token')
                    },
                    body: JSON.stringify(event)
                });
            }
            var deleteConfirm = confirm('일정을 삭제하시겠습니까?');
            if (deleteConfirm) {
                fetch(`/events/${eventObj.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrf_token')
                    }
                })
                .then(() => {
                    eventObj.remove();
                });
            }
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
