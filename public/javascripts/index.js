let modal = document.getElementById("myModal");
let btn = document.getElementsByClassName("startButton")[0];
let span = document.getElementsByClassName("close")[0];
let btnNo = document.getElementById("no");

btn.onclick = function() {
    modal.style.display = "block";
}

span.onclick = function () {
    modal.style.display = "none";
}

btnNo.onclick = function () {
    modal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

function startGame() {
    const numberOfPlayers = document.getElementById("numberOfPlayers").value;
    if (numberOfPlayers > 8 || numberOfPlayers < 2) {
        modal.style.display = "none";
        alert("Please only select a value between 2 and 8!");
        return;
    }
    fetch('/new?players=' + numberOfPlayers).then(response => {
        if (!response.ok) {
            console.error("Failed starting new game!");
        } else {
            window.location.href = '/kniffel';
        }
    });
}