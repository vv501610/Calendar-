// document.getElementById('registerForm').addEventListener('submit', function(event) {
//     event.preventDefault();
//     const username = document.getElementById('registerUsername').value;
//     const password = document.getElementById('registerPassword').value;

//     fetch('/register', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ username, password })
//     })
//     .then(response => response.text())
//     .then(data => {
//         alert(data);
//     });
// });

// document.getElementById('loginForm').addEventListener('submit', function(event) {
//     event.preventDefault();
//     const username = document.getElementById('loginUsername').value;
//     const password = document.getElementById('loginPassword').value;

//     fetch('/login', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ username, password })
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.token) {
//             alert('로그인 성공! 토큰: ' + data.token);
//         } else {
//             alert('로그인 실패');
//         }
//     });
// });

