function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
        .replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
}

function getCookie(cookieName) {
    const cookiesArray = document.cookie.split(';');
    for (let i = 0; i < cookiesArray.length; i++) {
        let cookie = cookiesArray[i].trim();
        if (cookie.startsWith(`${cookieName}=`)) {
            return cookie.substring(cookieName.length + 1);
        }
    }
    if (cookieName === "user") {
        return "unknownUser";
    }
    return undefined;
}


function buildChat() {
    const chatContainer = document.getElementById("chatContainer");
    const chatButton = document.getElementById("chatButton");
    const chatClose = document.getElementById("chatClose");
    if (getCookie("chatUrl") === undefined) {
        document.cookie = `chatUrl=http://85.215.67.144/${uuidv4()}/messages`
    }

    const refreshBtn = document.getElementById("refresh");
    const listOfMessages = document.getElementById("list");
    const comment = document.getElementById("your-message");
    const submitBtn = document.getElementById("submit");

    const refreshChat = () => {
        // for future authorization
        /*let username = "chatUser";
        let password = "";
        let credentials = username + ":" + password;
        let authToken = "Basic " + btoa(credentials);*/
        $.ajax({
            method: "GET", dataType: "json", url: getCookie("chatUrl"),
            success: function (data) {
                listOfMessages.innerHTML = "";
                const messages = data.messages;
                messages.forEach((message) => {
                    const content = message.content;
                    const author = message.author;
                    const minutesAgo = Math.round((new Date() - new Date(message.created_at)) / 60000);
                    const fullMessage = `<li>${content} (posted <span class="date">${minutesAgo} minutes ago</span>) by ${author}</li>`;
                    listOfMessages.insertAdjacentHTML("afterbegin", fullMessage);
                });
            }
        });
    };

    refreshBtn.addEventListener("click", refreshChat);

    const postMessage = () => {
        // for future authorization
        /*let username = "chatUser";
        let password = "";
        let credentials = username + ":" + password;
        let authToken = "Basic " + btoa(credentials);*/

        const myMessage = { author: getCookie("user"), content: comment.value };
        $.ajax({
            type: "POST", url: getCookie("chatUrl"),
            data: JSON.stringify(myMessage),
            success: function (data) {
                const message = document.getElementById('your-message');
                message.value = '';
                refreshChat();
            }
        });
    };

    submitBtn.addEventListener("click", (event) => {
        // avoid the default behavior of page loading
        event.preventDefault();
        postMessage();
    });

    // refresh the app automatically
    document.addEventListener("DOMContentLoaded", refreshChat);

    chatButton.addEventListener('click', function () {
        chatContainer.style.display = 'block';
        chatButton.style.display = 'none';
        refreshChat();
    });

    chatClose.addEventListener('click', function () {
        chatContainer.style.display = 'none';
        chatButton.style.display = 'unset';
    });
}

function isRunning() {
    $.ajax({
        url: '/isRunning', type: 'GET', success: function (data) {
            const board = document.querySelector('.board');
            if (data.isRunning) {
                document.getElementById('actionGame').classList.remove('disabled');
                if (board) {
                    board.style = '';
                }
            } else {
                document.getElementById('actionGame').classList.add('disabled');
                if (board) {
                    board.style = 'display: none';
                }
            }
        }
    });
}

$(document).ready(function () {
    isRunning();

    buildChat();

    $('a').each(function () {
        if ($(this).prop('href') == window.location.href) {
            $(this).addClass('active');
            $(this).parents('li').addClass('active');
        }
    });

});

