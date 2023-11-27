$(document).ready(function () {
    const btnStart = document.getElementById('startGameButton');
    btnStart.onclick = function () {
        const numberOfPlayers = document.getElementById("numberOfPlayers").value;
        if (numberOfPlayers > 8 || numberOfPlayers < 2) {
            alert("Please only select a value between 2 and 8!");
            return;
        }
        $.ajax({
            method: "GET", url: '/new?players=' + numberOfPlayers,
            success: function () {
                window.location.href = '/kniffel';
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Failed starting new game!");
            }
        });
    };
});