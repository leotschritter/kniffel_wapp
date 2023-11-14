function startGame() {
    const numberOfPlayers = document.getElementById("numberOfPlayers").value;
    if (numberOfPlayers > 8 || numberOfPlayers < 2) {
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