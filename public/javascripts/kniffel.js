const firstColumn = [
    "assets/images/3_mal_1.png", "assets/images/3_mal_2.png", "assets/images/3_mal_3.png",
    "assets/images/3_mal_4.png", "assets/images/3_mal_5.png", "assets/images/3_mal_6.png", "total", "bonus from 63",
    "total top part", "three of a kind", "four of a kind", "Full-House", "Small Street", "Big Street", "Kniffel", "Chance",
    "total bottom part", "total top part", "grand total"
];
const secondColumn = [
    "only ones count", "only twos count", "only threes count", "only fours count",
    "only fives count", "only sixes count", "assets/images/right_arrow.png", "plus 35", "assets/images/right_arrow.png",
    "all pips count", "all pips count", "25 points", "30 points", "40 points", "50 points", "all pips count",
    "assets/images/right_arrow.png", "assets/images/right_arrow.png", "assets/images/right_arrow.png"
];
// Maybe use indices instead of abbreviations?
const writeDownMappingsForLowerPart = ["3X", "4X", "FH", "KS", "GS", "KN", "CH"];

const bottomPart = {
    9: "3X",
    10: "4X",
    11: "home",
    12: "small_street.png",
    13: "big_street.png",
    14: "5X",
    15: "support"
};

function dice() {
    const diceCup = document.querySelector('.cup');
    const diceInCupElement = document.getElementById('diceInCup');
    diceInCupElement.innerHTML = '';
    $.ajax({
        url: '/dice',
        method: 'GET',
        success: function (data) {
            diceCup.style = `background: url('assets/images/cup.png') no-repeat;`
            buildDiceCupElement(data.dicecup, true)
        }
    });
}

function putIn(diceElement) {
    $.ajax({
        url: '/in', type: 'GET', data: {
            'in': diceElement.getAttribute('value')
        },
        success: function (data) {
            buildDiceCupElement(data.dicecup)
        }
    })

}

function putOut(diceElement) {
    $.ajax({
        url: '/out', type: 'GET', data: {

            'out': diceElement.getAttribute('value')
        },
        success: function (data) {
            buildDiceCupElement(data.dicecup)
        }
    })
}

function writeTo(index) {
    $.ajax({
        url: '/write', type: 'GET', data: {
            'to': index
        },
        success: function (data) {
            buildTableFromJson(data)
            buildDiceCupElement(data.controller.dicecup)
        }
    })
}

function buildField() {
    $.ajax({
        url: '/field', type: 'GET', success: function (data) {
            buildTableFromJson(data)
        }
    })
}

function putAllIn() {

    $.ajax({
        url: '/in/all', type: 'GET', success: function (data) {
            buildDiceCupElement(data.dicecup)
        }
    })

}

function save() {
    $.ajax({url: '/save', type: 'GET'})
}

function load() {
    $.ajax({
        url: '/load', type: 'GET', success: function (data) {
            buildTableFromJson(data);
            buildDiceCupElement(data.dicecup)
        }
    });
}

function undo() {
    $.ajax({
        url: '/undo', type: 'GET', success: function (data) {
            buildTableFromJson(data);
            buildDiceCupElement(data.dicecup)
        }
    });
}

function redo() {
    $.ajax({
        url: '/redo', type: 'GET', success: function (data) {
            buildTableFromJson(data);
            buildDiceCupElement(data.dicecup)
        }
    });
}

function buildDiceCupElement(diceCupJson, isDice) {
    if (isDice === true) {
        const animatedElement = document.querySelector('.cup');
        const diceCupAudio = new Audio('assets/sounds/dice_sound.mp3');
        animatedElement.addEventListener('animationstart', () => {
            diceCupAudio.play().then();
        });
        animatedElement.classList.add('showCup');
        waitForAnimationEnd(animatedElement).then(() => {
            animatedElement.style.background = 'none';
            animatedElement.style.animation = 'none';
            buildInCup(diceCupJson.incup)
        });
    } else {
        buildInCup(diceCupJson.incup)
    }
    buildActionBox(diceCupJson.remainingDices)
    buildDiceStorage(diceCupJson.stored)
}

function buildActionBox(remainingDices) {
    const btnDice = document.getElementById('diceButton');
    const btnAllIn = document.getElementById('allInButton');

    for (let i = 1; i <= 3; i++) {
        let remDiceElement = document.getElementById("remDice" + i)
        if (remainingDices < i - 1) {
            remDiceElement.setAttribute("style", "opacity: 0.3");
        } else {
            remDiceElement.setAttribute("style", "");
        }
    }
    if (remainingDices < 0) {
        btnDice.setAttribute("disabled", "disabled");
    } else {
        btnDice.removeAttribute("disabled");
    }
    btnDice.addEventListener('click', dice);
    btnAllIn.addEventListener('click', putAllIn)
}

function buildInCup(inCup) {
    const diceInCupElement = document.getElementById('diceInCup');
    diceInCupElement.innerHTML = '';
    for (let i = 0; i < inCup.length; i++) {
        let diceElement = document.createElement('div');
        diceElement.className = 'dice d' + (i + 1) + ' dice_' + inCup[i] + ' inCup';
        diceElement.setAttribute('value', inCup[i]);
        diceElement.style.visibility = 'visible';
        diceInCupElement.appendChild(diceElement);
        diceElement.addEventListener('click', function () {
            putOut(diceElement);
        });
    }
}

function buildDiceStorage(stored) {
    const diceStorageElement = document.getElementById('diceStorage');
    diceStorageElement.innerHTML = ''
    for (let i = 0; i < stored.length; i++) {
        let diceElement = document.createElement('div');
        diceElement.className = 'dice dice_' + stored[i] + ' stored';
        diceElement.setAttribute('value', stored[i]);
        diceElement.style.visibility = 'visible';
        diceStorageElement.appendChild(diceElement);
        diceElement.addEventListener('click', function () {
            putIn(diceElement);
        });
    }
}

function buildTableFromJson(jsonData) {
    const controller = jsonData.controller;
    const matrix = jsonData.controller.field.rows;
    const currentPlayer = jsonData.controller.game.currentPlayerID;

    const gameTable = document.getElementById('gameTable');
    gameTable.innerHTML = '';

    const thead = document.createElement('thead');
    const trHeading = document.createElement('tr');
    const thScrollDown = document.createElement('th');
    const thPopoverButton = document.createElement('th');

    trHeading.className = "main-heading";
    thScrollDown.innerHTML = '<button type="button" id="scrollDown" class="btn btn-block"><span class="material-symbols-outlined">expand_content</span></button>';
    thPopoverButton.innerHTML = '<button id="popoverButton" type="button" class="btn btn-dark" data-bs-html="true" data-bs-container="body" ' +
        'data-bs-toggle="popover" data-bs-title="Available Options" data-bs-placement="bottom" data-bs-trigger="hover" ' +
        '' + 'data-bs-content="' + ("<table class='popover-table'><tr>" + (new Array(19).fill().map((_, row)  => {
            if (row === 6) {
                return '</tr><tr>';
            }
            if (matrix[row][currentPlayer] === '') {
                if (row < 6) {
                    return `<td><img src='assets/images/${row + 1}.png'/></td>`;
                } else if (row === 9 || row === 10 || row === 14) {
                    return `<td><div>${bottomPart[row]}</div></td>`;
                } else if (row === 11 || row === 15) {
                    return `<td><span class='material-symbols-outlined'>${bottomPart[row]}</span></td>`;
                } else if (row === 12 || row === 13) {
                    return `<td><img src='assets/images/${bottomPart[row]}'/></td>`;
                }
            }
        })).toString().replaceAll(",", "") + '</tr></table>').toString() + '\"' + '>Available Options</button>'
    ;

    thScrollDown.onclick = function () {
        document.querySelector('.table-container').scrollIntoView();
    }


    trHeading.appendChild(thScrollDown);
    trHeading.appendChild(thPopoverButton);

    for (let col = 0; col < matrix[0].length; col++) {
        const thPlayer = document.createElement('th');
        thPlayer.innerHTML = controller.game.players[0][col].name;
        trHeading.appendChild(thPlayer);
    }

    thead.appendChild(trHeading);
    gameTable.appendChild(thead);


    for (let row = 0; row < matrix.length; row++) {
        const tr = document.createElement('tr');

        for (let col = 0; col < matrix[0].length + 2; col++) {
            const td = document.createElement('td');

            if (col === 0) {
                if (row < 6) {
                    const button = document.createElement('button');
                    button.className = 'btnAction';
                    button.innerHTML = `<img src="${firstColumn[row]}" />`;
                    if (matrix[row][currentPlayer] !== '') {
                        button.setAttribute("disabled", "disabled");
                    }
                    button.addEventListener('click', function () {
                        writeTo(row + 1)
                    });
                    td.appendChild(button);
                } else if (row > 8 && row < 16) {
                    const button = document.createElement('button');
                    button.className = 'btnAction';
                    button.innerHTML = `${firstColumn[row]}`;
                    if (matrix[row][currentPlayer] !== '') {
                        button.setAttribute("disabled", "disabled");
                    }
                    button.addEventListener('click', function () {
                        writeTo(writeDownMappingsForLowerPart[row - 9])
                    });
                    td.appendChild(button);
                } else {

                    td.innerHTML = `${firstColumn[row]}`;
                }
            } else if (col === 1) {
                td.className = "secondColumn"
                if (row === 6 || row === 8 || row > 15) {
                    td.innerHTML = `<span class="material-symbols-outlined">arrow_right_alt</span>`
                } else {
                    td.innerHTML = `${secondColumn[row]}`
                }

            } else {
                if (col === currentPlayer + 2) {
                    td.className = 'activeCol';
                }
                td.innerHTML = `<span class="cell">${matrix[row][col - 2]}</span>`;
            }

            tr.appendChild(td);
        }

        gameTable.appendChild(tr);
    }
    $('[data-bs-toggle="popover"]').popover();
}

function waitForAnimationEnd(element) {
    return new Promise(resolve => {
        element.addEventListener('animationend', function handler() {
            element.removeEventListener('animationend', handler);
            resolve();
        });
    });
}


$(document).ready(function () {
    // navigation

    document.getElementById('actions').style.display = "unset";

    document.getElementById('actionSave').addEventListener('click', function () {
        save()
    });
    document.getElementById('actionLoad').addEventListener('click', function () {
        load()
    });
    document.getElementById('actionUndo').addEventListener('click', function () {
        undo()
    });
    document.getElementById('actionRedo').addEventListener('click', function () {
        redo()
    });

    // diceCup
    $.ajax({
        url: '/dicecup', type: 'GET', success: function (data) {
            buildDiceCupElement(data.dicecup)
        }
    });

    // field popover
    bootstrap.Popover.Default.allowList.table = [];
    bootstrap.Popover.Default.allowList.thead = [];
    bootstrap.Popover.Default.allowList.tbody = [];
    bootstrap.Popover.Default.allowList.tr = [];
    bootstrap.Popover.Default.allowList.td = [];

    // field
    buildField()
});