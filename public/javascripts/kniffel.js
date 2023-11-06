
function putIn(routeString) {
    fetch('/in?in=' + encodeURIComponent(routeString)).then(response => {
        if (!response.ok) {
            console.error("Failed putting dices in!");
        } else {
            window.location.href = '/kniffel';
        }
    });
}

function putOut(routeString) {
    fetch('/out?out=' + encodeURIComponent(routeString)).then(response => {
        if (!response.ok) {
            console.error("Failed putting dices out!");
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

const animatedElement = document.getElementsByClassName('cup')[0];
animatedElement.classList.add('showCup');
document.getElementById('actions').style = "";

waitForAnimationEnd(animatedElement).then(() => {
    animatedElement.style.background = 'none';
    const inCupElements = [...document.getElementsByClassName('diceInCup')[0].children];
    for (const dice of inCupElements) {
        dice.style.visibility = 'visible';
    }
});