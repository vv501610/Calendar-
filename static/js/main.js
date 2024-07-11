document.addEventListener('DOMContentLoaded', function() {

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = '#4CAF50';
        notification.style.color = 'white';
        notification.style.padding = '15px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
        document.body.appendChild(notification);
    
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        googleCalendarApiKey: "AIzaSyDJMW46KlS9mjPYpcUn5dbudBk2TDtXrQo",
        initialView: 'dayGridMonth',
        locale: 'ko',
        events: async function(fetchInfo, successCallback, failureCallback) {
            try {
                const response = await fetch('/events');
                const data = await response.json();
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
                info.el.style.backgroundColor = 'rgb(80, 80, 80)';
                info.el.style.borderColor = 'rgb(80, 80, 80)';
            } else if (diffDays === 0) {
                 // 당일 일정
                 info.el.style.backgroundColor = 'rgb(0, 50, 80)';
                 info.el.style.borderColor = 'rgb(0, 50, 80)';
            } else if (diffDays > 30) {
                // 30일 이상 남은 일정은 회색으로 표기 
                    info.el.style.backgroundColor = 'rgb(150, 180, 180)';
                    info.el.style.borderColor = 'rgb(150, 180, 180)';
            } else {
                // 다가올 일정
                var brightnessIncrease = 130;
        
                var redComponent = Math.min(80 , 30+ brightnessIncrease , 255);
                var blueComponent = Math.min(200, 180- diffDays * 3 + (brightnessIncrease), 255);
                var greenComponent = Math.min(220, (diffDays * 2) + (brightnessIncrease - (diffDays * -1)), 255);
        
                var color = `rgb(${redComponent}, ${greenComponent}, ${blueComponent})`;
                info.el.style.backgroundColor = color;
                info.el.style.borderColor = color;
            }
        },
        selectable: true,
        select: function(info) {
            showPanel('add', info);
        },
        eventClick: function(info) {
            showPanel('edit', info.event);
        }
    });
    calendar.render();

    function showPanel(mode, info) {
        const panel = document.getElementById('panel');
        const panelTitle = document.getElementById('panel-title');
        const panelId = document.getElementById('panel-id');
        const panelSave = document.getElementById('panel-save');
        const panelDelete = document.getElementById('panel-delete');
        const panelClose = document.getElementById('panel-close');

        panel.style.display = 'block';
        
        if (mode === 'add') {
            panelTitle.value = '';
            panelId.value = '';
            panelSave.textContent = '저장';
            panelDelete.style.display = 'none';
        } else {
            panelTitle.value = info.title;
            panelId.value = info.id;
            panelSave.textContent = '수정';
            panelDelete.style.display = 'inline-block';
        }

        panelSave.onclick = function() {
            const title = panelTitle.value;
            if (title) {
                if (mode === 'add') {
                    const event = {
                        title: title,
                        start: info.startStr,
                        end: info.endStr
                    };
                    fetch('/events', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(event)
                    })
                    .then(response => response.json())
                    .then(data => {
                        calendar.addEvent(data);
                        panel.style.display = 'none';
                        
                    });
                } else {
                    const event = {
                        id: panelId.value,
                        title: title,
                        start: info.start,
                        end: info.end
                    };
                    fetch('/events', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(event)
                    })
                    .then(response => response.json())
                    .then(data => {
                        info.remove();
                        calendar.addEvent(data);
                        panel.style.display = 'none';
                    });
                }
            }
        };

        panelDelete.onclick = function() {
            if (confirm('정말로 이 일정을 삭제하시겠습니까?')) {
                fetch(`/events?id=${panelId.value}`, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .then(data => {
                    info.remove();
                    panel.style.display = 'none';
                    showNotification(data.message);
                });
            }
        };

        panelClose.onclick = function() {
            panel.style.display = 'none';
        };
    }

});



