const app = Vue.createApp({})

app.component('diceBoard', {
    data() {
        return {
            incup: [],
            remainingDices: 2,
            stored: [],
            active: false,
            websocket: new WebSocket("ws://localhost:9000/websocket"),
            playerID: 0,
            playerName: ""

        }
    },
    created() {
        this.initSocket()
    },
    methods: {
        initSocket() {
            websocket.onopen = function (event) {
                this.waitForPlayer((p) => {
                    const player = JSON.parse(p);
                    this.playerID = player.id;
                    this.playerName = player.name;
                    const timestamp = player.timestamp;
                    this.onWebSocketOpen();
                    this.websocket.send(JSON.stringify({
                        event: "playerJoined",
                        name: this.playerName,
                        id: this.playerID,
                        timestamp: timestamp
                    }));
                    if (this.playerID === 0) {
                        this.active = true;
                    }
                });
                console.log("Connected to Websocket");
            }
        },
        dice() {
            $.ajax({
                url: '/dice',
                method: 'GET',
                success: function (data) {
                    this.incup = data.incup
                    this.stored = data.stored
                    this.remainingDices = data.remainingDices
                },
                error: function () {
                    console.error('Failed to get dicecup JSON.');
                }
            });
        },
        putIn(diceElement) {
            $.ajax({
                url: '/in', type: 'GET', data: {
                    'in': diceElement.getAttribute('value')
                }, success: function (data) {
                    this.incup = data.incup
                    this.stored = data.stored
                },
                error: function () {
                    console.error('Failed to get dicecup JSON.');
                }
            })

        },
        putOut(diceElement) {
            $.ajax({
                url: '/out', type: 'GET', data: {
                    'out': diceElement.getAttribute('value')
                }, success: function(data) {
                    this.incup = data.incup
                    this.stored = data.stored
                },
                error: function () {
                    console.error('Failed to get dicecup JSON.');
                }
            })
        },
        putAllIn() {
            $.ajax({
                url: '/in/all', type: 'GET',
                success: function(data) {
                  this.diceCup = data.incup
                  this.diceStorage = data.stored
                },
                error: function () {
                    console.error('Failed to get dicecup JSON.');
                }
            })
        },
        onWebSocketOpen() {
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
                }, error: function () {
                    console.error('Failed to get dicecup JSON.');
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
        },
        waitForPlayer(callback) {
            const player = sessionStorage['player'];

            if (player) {
                callback(player);
            } else {
                setTimeout(() => {
                    console.error("Failed reading player! Retrying...");
                    this.waitForPlayer(callback);
                }, 1000);
            }
        }

    },
    template:
        `
        <div class="diceBoard" id="diceBoard">
            <div class="cup" style="background: none; animation: none;">
                <div v-if="inCup" id="diceInCup">
                    <div v-for="(diceValue, index) in incup"
                        v-bind:key="index"
                        class="dice"
                        v-bind:class="'d' + (index + 1) + ' dice_' + diceValue + ' inCup'"
                        v-bind:value="diceValue"
                        v-bind:style="{visibility: 'visible', pointerEvents: active ? 'unset' : 'none'}" 
                        v-on:click="putOut(diceValue)">
                        
                        
                    </div>
                </div>
                <div class="actionBox">
                    <img src="assets/images/dicecup_small.png" id="remDice3"/>
                    <img src="assets/images/dicecup_small.png" id="remDice2"/>
                    <img src="assets/images/dicecup_small.png" id="remDice1"/>
                    <button type="button" style="margin-top: 5px" id="allInButton" class="btn btn-dark" 
                    v-on:click="putAllIn">
                        <span class="material-symbols-outlined">keyboard_double_arrow_left</span>
                    </button>
                    <button type="button" style="margin-top: 5px;" id="diceButton" class="btn btn-dark"
                            v-on:click="dice" v-bind:disabled="remainingDices < 0">
                        <img style="margin-top: -5px;" width="40px" src="assets/images/flying_dices_small_white.png"/>
                    </button>
                </div>
                <div class="diceStorage" id="diceStorage">
                    <div v-if="storage" id="diceStorage">
                        <div v-for="(diceStorage, index) in locked"
                             v-bind:key="index"
                             v-on:click="putIn(diceValue)"
                             class="dice"
                             v-bind:class="'d' + (index + 1) + ' dice_' + diceValue + ' stored'"
                             v-bind:value="diceValue"
                             v-bind:style="{visibility: 'visible', pointerEvents: active ? 'unset' : 'none'}"
                        >
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `
});

app.mount('#vuecontainer')

let playerID;
let playerName;
let websocket;
let active = false;
const firstColumn = [
    "assets/images/3_mal_1.png", "assets/images/3_mal_2.png", "assets/images/3_mal_3.png",
    "assets/images/3_mal_4.png", "assets/images/3_mal_5.png", "assets/images/3_mal_6.png", "total", "bonus from 63",
    "total top part", "three of a kind", "four of a kind", "Full-House", "Small Street", "Big Street",
    "Kniffel", "Chance",
    "total bottom part", "total top part", "grand total"
];
const secondColumn = [
    "only ones count", "only twos count", "only threes count", "only fours count",
    "only fives count", "only sixes count", "assets/images/right_arrow.png", "plus 35",
    "assets/images/right_arrow.png",
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


function writeTo(index) {
    $.ajax({
        url: '/write', type: 'GET', data: {
            'to': index
        },
        success: function () {
            console.log("call nextRound");
            websocket.send(JSON.stringify({event: "nextRound"}));
        },
        error: function () {
            console.error('Failed to write down the result from the last move.');
        }
    })
}

function buildField() {
    $.ajax({
        url: '/field', type: 'GET', success: function (data) {
            buildTableFromJson(data)
        }, error: function () {
            console.error('Failed to build Table from JSON.');
        }
    })
}

function save() {
    $.ajax({
        url: '/save', method: 'GET',
        error: function () {
            console.error('Failed to save game.');
        }
    })
}

function load() {
    $.ajax({
        url: '/load', method: 'GET',
        error: function () {
            console.error('Failed to load game.');
        }
    });
}

function undo() {
    $.ajax({
        url: '/undo', method: 'GET',
        error: function () {
            console.error('Failed to undo the last move.');
        }
    });
}

function redo() {
    $.ajax({
        url: '/redo', method: 'GET',
        error: function () {
            console.error('Failed to redo the previous move.');
        }
    });
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
        '' + 'data-bs-content="' + ("<table class='popover-table'><tr>" + (new Array(19).fill().map((_, row) => {
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
    deactivateTableButtons();
}

function deactivateTableButtons() {
    if (active)
        return;
    const table = document.getElementById('gameTable');
    const trCollection = table.getElementsByTagName('TR')
    for (let i = 1; i < trCollection.length; i++) {
        const btnCollection = trCollection[i].getElementsByTagName('BUTTON');
        for (const btn of btnCollection) {
            btn.disabled = true;
        }
    }
}

function waitForAnimationEnd(element) {
    return new Promise(resolve => {
        element.addEventListener('animationend', function handler() {
            element.removeEventListener('animationend', handler);
            resolve();
        });
    });
}


function connectWebSocket() {
    const diceCup = document.querySelector('.cup');
    const diceInCupElement = document.getElementById('diceInCup');

    const websocket = new WebSocket("ws://localhost:9000/websocket");


    websocket.onclose = function () {
        console.log('Connection with Websocket Closed!');
    };

    websocket.onerror = function (error) {
        console.log('Error in Websocket Occured: ' + error);
    };

    websocket.onmessage = function (e) {
        if (typeof e.data === "string") {
            if (JSON.parse(e.data).controller !== undefined) {
                buildTableFromJson(JSON.parse(e.data));
                buildDiceCupElement(JSON.parse(e.data).dicecup)
            } else if (JSON.parse(e.data).dicecup !== undefined) {
                console.log("DiceCup Changed");
                if (JSON.parse(e.data).isDice) {
                    diceInCupElement.innerHTML = '';
                    diceCup.style = `background: url('assets/images/cup.png') no-repeat;`
                    buildDiceCupElement(JSON.parse(e.data).dicecup, JSON.parse(e.data).isDice);
                } else {
                    buildDiceCupElement(JSON.parse(e.data).dicecup, JSON.parse(e.data).isDice);
                    buildField();
                }
            } else if (JSON.parse(e.data).field !== undefined) {
                buildField()
                /*console.log("Field Changed")*/
            } else if (JSON.parse(e.data).event === "turnChangedMessageEvent") {
                console.log("playerID: " + playerID + "; currentTurn: " + JSON.parse(e.data).currentTurn);
                if (playerID !== JSON.parse(e.data).currentTurn) {
                    active = false;
                    console.log("deactivate");
                    // deactivateButtons(true);
                } else {
                    active = true;
                    console.log("activate");
                    // deactivateButtons(false);
                }
                buildActionBox(2);
                buildField();
            } else if (JSON.parse(e.data).event === "refreshChatsMessageEvent") {
                refreshChat()
            } else {
                /*console.log("Other Change")*/
            }/* else if (JSON.parse(e.data).game !== undefined) { // not in use yet
                console.log("Game Changed")
            }*/
            /*console.log(e.data)*/
        }
    };
    return websocket;
}

function refreshChat() {
    const listOfMessages = document.getElementById("list");
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
        },
        error: function (err) {
            console.error("Failed reloading messages: %o", err);
        }
    });
}

const postMessage = () => {
    const comment = document.getElementById("your-message");
    // for future authorization
    /*let username = "chatUser";
    let password = "";
    let credentials = username + ":" + password;
    let authToken = "Basic " + btoa(credentials);*/

    const myMessage = {author: JSON.parse(sessionStorage['player']).name, content: comment.value};
    $.ajax({
        type: "POST", url: getCookie("chatUrl"),
        data: JSON.stringify(myMessage),
        success: function (data) {
            const message = document.getElementById('your-message');
            message.value = '';
            websocket.send(JSON.stringify({event: "refreshChats"}));
        },
        error: function (err) {
            console.error("Failed sending message: %o", err);
        }
    });
};
/*function setNameT(name, value) {
let cookiesArray = document.cookie.split(';')
for (let i = 0; i < cookiesArray.length; i++) {
let cookie = cookiesArray[i].trim();
if (cookie.startsWith(` ${name}=`)) {
cookiesArray[i] = `${name}=${value}`
document.cookie = cookiesArray.join(';')
return
}
}
document.cookie = `${name}=${value};${document.cookie}`;
}*/
$(document).ready(function () {
    const btnChat = document.getElementById('chatButton');
    btnChat.hidden = false;
    websocket = connectWebSocket();
});