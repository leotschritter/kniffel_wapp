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


$(function () {
    $('a').each(function () {
        if ($(this).prop('href') == window.location.href) {
            $(this).addClass('active');
            $(this).parents('li').addClass('active');
        }
    });
});

$(document).ready(function () {
    const chatContainer = document.getElementById("chatContainer");
    const chatButton = document.getElementById("chatButton");
    const chatClose = document.getElementById("chatClose");
    if (getCookie("chatUrl") === undefined) {
        document.cookie = `chatUrl=http://85.215.67.144/${uuidv4()}/messages`
    }
    // selecting the elements
    const refreshBtn = document.getElementById("refresh");
    const listOfMessages = document.getElementById("list");
    const comment = document.getElementById("your-message");
    const submitBtn = document.getElementById("submit");

    // http GET request to refresh the list of comments
    const refreshChat = () => {
        fetch(getCookie("chatUrl"))
            .then(response => response.json())
            .then((data) => {
                // to clean the list and avoid repetition
                listOfMessages.innerHTML = "";
                // digging into the json
                const messages = data.messages;
                messages.forEach((message) => {
                    const content = message.content;
                    const author = message.author;
                    const minutesAgo = Math.round((new Date() - new Date(message.created_at)) / 60000);
                    const fullMessage = `<li>${message.content} (posted <span class="date">${minutesAgo} minutes ago</span>) by ${author}</li>`;
                    listOfMessages.insertAdjacentHTML("afterbegin", fullMessage);
                });
            });
    };

    refreshBtn.addEventListener("click", refreshChat);

    // http POST request to write messages, send them to the API and display them in the chat
    const postMessage = () => {
        const myMessage = { author: getCookie("user"), content: comment.value };
        console.log(myMessage);
        fetch(getCookie("chatUrl"), {
            method: "POST",
            body: JSON.stringify(myMessage)
        })
            // parse response as a json
            .then(response => response.json())
            .then((data) => {
                refreshChat();
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
});

