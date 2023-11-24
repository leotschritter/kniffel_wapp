function putOut(routeString) {
    fetch('/out?out=' + encodeURIComponent(routeString)).then(response => {
        if (!response.ok) {
            console.error("Failed putting dices out!");
        } else {
            window.location.href = '/kniffel';
        }
    });
}

function putIn(routeString) {
    fetch('/in?in=' + encodeURIComponent(routeString)).then(response => {
        if (!response.ok) {
            console.error("Failed putting dices in!");
        } else {
            window.location.href = '/kniffel';
        }
    });
}

function waitForAnimationEnd(element) {
    return new Promise(resolve => {
        element.addEventListener('animationend', function handler() {
            element.removeEventListener('animationend', handler);
            resolve();
        });
    });
}

$(document).ready(function() {
    // navigation
    document.getElementById('actions').style.display = "unset";
    // diceCup
    const diceInCup = document.querySelector('.diceInCup').children;
    const diceStorage = document.querySelector('.diceStorage').children
    const btnAllIn = document.getElementById('allInButton');
    const btnDice = document.getElementById('diceButton');
    const animatedElement = document.querySelector('.cup');
    const diceCupAudio = new Audio('assets/sounds/dice_sound.mp3');
    // field
    const actionButtons = document.querySelectorAll('.btnAction');
    const btnScrollDown = document.getElementById('scrollDown');
    // field popover
    bootstrap.Popover.Default.allowList.table = [];
    bootstrap.Popover.Default.allowList.thead = [];
    bootstrap.Popover.Default.allowList.tbody = [];
    bootstrap.Popover.Default.allowList.tr = [];
    bootstrap.Popover.Default.allowList.td = [];
    $('[data-bs-toggle="popover"]').popover();

    // diceCup animation
    animatedElement.addEventListener('animationstart', (ev) => {
        diceCupAudio.play().then();
    });
    animatedElement.classList.add('showCup');
    waitForAnimationEnd(animatedElement).then(() => {
        animatedElement.style.background = 'none';
        const inCupElements = [...document.getElementsByClassName('diceInCup')[0].children];
        for (const dice of inCupElements) {
            dice.style.visibility = 'visible';
        }
        window.location.href = '/kniffel';
    });
    // diceCup
    for (const die of diceInCup) {
        die.onclick = function() {
            putOut(die.getAttribute("value"))
        }
    }
    for (const die of diceStorage) {
        die.onclick = function() {
            putIn(die.getAttribute("value"))
        }
    }
    btnAllIn.onclick = function () {
        putIn(btnAllIn.getAttribute("dice"));
    }
    btnDice.onclick = function () {
        window.location.href = 'dice';
    }
    // field
    btnScrollDown.onclick = function () {
        document.querySelector('.table-container').scrollIntoView();
    }
    for (const action of actionButtons) {
        action.onclick = function () {
            fetch('/write?to=' + encodeURIComponent(action.getAttribute("writeto"))).then(response => {
               if (!response.ok) {
                   console.error("Failed writing " + action.getAttribute("writeto") + " down");
               }  else {
                   window.location.href = '/kniffel';
               }
            });
        }
    }
});