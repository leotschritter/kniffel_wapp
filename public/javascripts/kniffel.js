const app = Vue.createApp({})

app.component('game', {
    data() {
        return {
            incup: [],
            remainingDices: 2,
            stored: [],
            active: false,
            gameSocket: undefined,
            playerID: 0,
            playerName: "",
            isDice: false,
            matrix: [],
            controller: {},
            currentPlayer: 0,
            numberOfPlayers: 0,
            players: [],
            firstColumn: [
                "assets/images/3_mal_1.png", "assets/images/3_mal_2.png", "assets/images/3_mal_3.png",
                "assets/images/3_mal_4.png", "assets/images/3_mal_5.png", "assets/images/3_mal_6.png", "total", "bonus from 63",
                "total top part", "three of a kind", "four of a kind", "Full-House", "Small Street", "Big Street",
                "Kniffel", "Chance",
                "total bottom part", "total top part", "grand total"
            ],
            secondColumn: [
                "only ones count", "only twos count", "only threes count", "only fours count",
                "only fives count", "only sixes count", "assets/images/right_arrow.png", "plus 35",
                "assets/images/right_arrow.png",
                "all pips count", "all pips count", "25 points", "30 points", "40 points", "50 points", "all pips count",
                "assets/images/right_arrow.png", "assets/images/right_arrow.png", "assets/images/right_arrow.png"
            ],
            // Maybe use indices instead of abbreviations?
            writeDownMappingsForLowerPart: ["3X", "4X", "FH", "KS", "GS", "KN", "CH"],
            bottomPart: {
                9: "3X",
                10: "4X",
                11: "home",
                12: "small_street.png",
                13: "big_street.png",
                14: "5X",
                15: "support"
            }
        }
    },
    created() {
        this.connectGameSocket()
    },
    methods: {
        getCurrentDiceCup() {
            $.ajax({
                url: '/dicecup', method: 'GET', success: (data) => {
                    this.incup = data.dicecup.incup
                    this.stored = data.dicecup.stored
                    this.remainingDices = data.dicecup.remainingDices
                }
            })

        },
        getCurrentField() {
          $.ajax({
              url: '/field', type: 'GET', success: (data) => {
                  this.matrix = data.controller.field.rows;
                  this.controller = data.controller;
                  this.currentPlayer = data.controller.game.currentPlayerID;
                  this.numberOfPlayers = this.matrix[0].length;
                  this.players = this.controller.game.players;
              }
          })
        },
        dice() {
            console.log("AAA")
            $.ajax({
                url: '/dice',
                method: 'GET',
                success: function (data) {
                    this.incup = data.dicecup.incup
                    this.stored = data.dicecup.stored
                    this.remainingDices = data.dicecup.remainingDices
                },
                error: function () {
                    console.error('Failed to get dicecup JSON.');
                }
            });
        },
        putIn(diceElement) {
            $.ajax({
                url: '/in', type: 'GET', data: {
                    'in': diceElement
                }, success: function (data) {
                    this.incup = data.dicecup.incup
                    this.stored = data.dicecup.stored
                },
                error: function () {
                    console.error('Failed to get dicecup JSON.');
                }
            })

        },
        putOut(diceElement) {
            $.ajax({
                url: '/out', type: 'GET', data: {
                    'out': diceElement
                }, success: function (data) {
                    this.incup = data.dicecup.incup
                    this.stored = data.dicecup.stored
                },
                error: function () {
                    console.error('Failed to get dicecup JSON.');
                }
            })
        },
        putAllIn() {
            $.ajax({
                url: '/in/all', type: 'GET',
                success: function (data) {
                    this.incup = data.dicecup.incup
                    this.stored = data.dicecup.stored
                },
                error: function () {
                    console.error('Failed to get dicecup JSON.');
                }
            })
        },
        writeTo(index) {
            $.ajax({
                url: '/write', type: 'GET', data: {
                    'to': index
                },
                success:  (data) => {
                    this.matrix = data.controller.field.rows;
                    this.controller = data.controller;
                    this.currentPlayer = data.controller.game.currentPlayerID;
                    this.numberOfPlayers = this.matrix[0].length;
                    this.players = this.controller.game.players;
                    console.log(this.players)
                    console.log("call nextRound");
                    this.gameSocket.send(JSON.stringify({event: "nextRound"}));
                },
                error: function () {
                    console.error('Failed to write down the result from the last move.');
                }
            })
        },
        onWebSocketOpen() {
            // navigation
            // TODO: Kann das weg? Wird grad in app.component('navbar'...) im template als on-click definiert.

            /*
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
                        });*/

            // diceCup
            $.ajax({
                url: '/dicecup', type: 'GET', success:  (data) => {
                    this.incup = data.dicecup.incup
                    this.remainingDices = data.dicecup.remainingDices
                    this.stored = data.dicecup.stored
                },


                error: function () {
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
            $.ajax({
                url: '/field', type: 'GET', success: (data) => {
                    this.matrix = data.controller.field.rows;
                    this.controller = data.controller;
                    this.currentPlayer = data.controller.game.currentPlayerID;
                    this.numberOfPlayers = this.matrix[0].length;
                    this.players = this.controller.game.players;
                }
            })
            // buildField()
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
        },
        connectGameSocket() {

            this.gameSocket = new WebSocket("ws://localhost:9000/websocket");

            this.gameSocket.onopen = (event) => {
                this.waitForPlayer((p) => {
                    const player = JSON.parse(p);
                    this.playerID = player.id;
                    this.playerName = player.name
                    console.log(this.playerName)
                    const timestamp = player.timestamp;
                    this.onWebSocketOpen();
                    this.gameSocket.send(JSON.stringify({
                        event: "playerJoined",
                        name: this.playerName,
                        id: this.playerID,
                        timestamp: timestamp
                    }));
                    console.log(this.playerID)
                    if (this.playerID === 0) {
                        this.active = true;
                    }
                });
                console.log("Connected to Websocket");
            }


            this.gameSocket.onclose = function () {
                console.log('Connection with Websocket Closed!');
            };

            this.gameSocket.onerror = function (error) {
                console.log('Error in Websocket Occured: ' + error);
            };

            this.gameSocket.onmessage = (e) => {
                if (typeof e.data === "string") {
                    if (JSON.parse(e.data).controller !== undefined) {
                        // buildTableFromJson(JSON.parse(e.data));
                        this.incup = e.data.incup
                        this.stored = e.data.stored
                        this.remainingDices = e.data.remainingDices
                        this.controller = e.data.controller
                        if (this.controller) {
                            this.matrix = this.controller.field.rows;
                            this.currentPlayer = this.controller.game.currentPlayerID;
                        }
                    } else if (JSON.parse(e.data).dicecup !== undefined) {
                        console.log("DiceCup Changed");
                        if (JSON.parse(e.data).isDice) {
                            this.diceCupAnimationStart();
                            this.incup = JSON.parse(e.data).dicecup.incup
                            this.remainingDices = JSON.parse(e.data).dicecup.remainingDices
                            this.stored = JSON.parse(e.data).dicecup.stored
                        } else {
                            this.incup = JSON.parse(e.data).dicecup.incup
                            this.remainingDices = JSON.parse(e.data).dicecup.remainingDices
                            this.stored = JSON.parse(e.data).dicecup.stored
                            // buildField();
                        }
                    } else if (JSON.parse(e.data).field !== undefined) {
                        this.matrix = e.data.field.rows;
                        // buildField()
                        /*console.log("Field Changed")*/
                    } else if (JSON.parse(e.data).event === "turnChangedMessageEvent") {
                        console.log("playerID: " + this.playerID + "; currentTurn: " + JSON.parse(e.data).currentTurn);
                        if (this.playerID !== JSON.parse(e.data).currentTurn) {
                            this.active = false;
                            console.log("deactivate");
                            // deactivateButtons(true);
                        } else {
                            this.active = true;
                            console.log("activate");
                            // deactivateButtons(false);
                        }
                        this.remainingDices = 2
                        // buildField();
                    } else if (JSON.parse(e.data).event === "refreshChatsMessageEvent") {
                        // refreshChat()
                    } else {
                        /*console.log("Other Change")*/
                    }/* else if (JSON.parse(e.data).game !== undefined) { // not in use yet
                console.log("Game Changed")
            }*/
                    /*console.log(e.data)*/
                }
            };

        },
        generatePopoverContent() {
            let content =  "<table class='popover-table'><tr>";
            for (let row = 0; row < this.matrix.length; row++) {
                if (row === 6) {
                    content += "</tr><tr>"
                }
                if (this.matrix[row][this.currentPlayer] === "") {
                    if (row < 6) {
                        content += `<td><img src='assets/images/${row + 1}.png'/></td>`;
                    } else if (row === 9 || row === 10 || row === 14) {
                        content += `<td><div>${this.bottomPart[row]}</div></td>`;
                    } else if (row === 11 || row === 15) {
                        content += `<td><span class='material-symbols-outlined'>${this.bottomPart[row]}</span></td>`;
                    } else if (row === 12 || row === 13) {
                        content += `<td><img src='assets/images/${this.bottomPart[row]}'/></td>`;
                    }
                }
            }
            content += "</tr></table>"
            return content;
        },
        restart() {
            $.ajax({
                url: '/restart', type: 'GET', success:  () => {
                    window.location.href = '/';
                }
            });
        },
        diceCupAnimationStart() {
            const animatedElement = document.querySelector('.cup');
            const diceCupAudio = new Audio('assets/sounds/dice_sound.mp3');
            animatedElement.addEventListener('animationstart', () => {
                diceCupAudio.play().then();
                for (const die of document.getElementById('diceInCup').children) {
                    die.style.visibility = 'hidden';
                }
            });
            animatedElement.style = "animation: 'auto ease 0s 1 normal none running'; background: url('/assets/images/cup.png')";
            animatedElement.classList.add('showCup');
            waitForAnimationEnd(animatedElement).then(() => {
                animatedElement.style.background = 'none';
                animatedElement.style.animation = 'none';
                for (const die of document.getElementById('diceInCup').children) {
                    die.style.visibility = 'visible';
                }
            });
        },
        zoomIntoField() {
            const thScrollDown = document.getElementById('scrollDown');
            thScrollDown.onclick = function () {
                document.querySelector('.table-container').scrollIntoView();
            }
        }
    },
    template:
        `
        <!--  DICEBOARD   -->
        <div class="d-flex justify-content-center">
            <div class="board">
            <div class="diceBoard">
                <div class="cup" style="background: none">
                    <div class="diceInCup" id="diceInCup">
                        <div v-for="(diceValue, index) in incup" v-bind:key="index" 
                            v-bind:class="'dice d' + (index + 1) + ' dice_' + diceValue + ' inCup'"
                            v-bind:value="diceValue" v-bind:style="{pointerEvents: active ? 'unset' : 'none', visibility: 'visible'}" 
                            @click="putOut(diceValue)">
                            
                        </div>
                    </div>
                </div>
            </div>    
            <div class="actionBox">
                <img src="assets/images/dicecup_small.png" id="remDice3" v-bind:style="remainingDices < 2 ? 'opacity: 0.3' : 'opacity: 1'"/>
                <img src="assets/images/dicecup_small.png" id="remDice2" v-bind:style="remainingDices < 1 ? 'opacity: 0.3' : 'opacity: 1'"/>
                <img src="assets/images/dicecup_small.png" id="remDice1" v-bind:style="remainingDices < 0 ? 'opacity: 0.3' : 'opacity: 1'"/>
                <button type="button" style="margin-top: 5px" id="allInButton" class="btn btn-dark" 
                @click="putAllIn" :disabled="!active">
                    <span class="material-symbols-outlined">keyboard_double_arrow_left</span>
                </button>
                <button type="button" style="margin-top: 5px;" id="diceButton" class="btn btn-dark"
                        @click="dice" v-bind:disabled="remainingDices < 0 | !active">
                    <img style="margin-top: -5px;" width="40px" src="assets/images/flying_dices_small_white.png"/>
                </button>
            </div>
            <div class="diceStorage" id="diceStorage">
                <div id="diceStorage">
                    <div v-for="(diceValue, index) in stored" v-bind:key="index" v-on:click="putIn(diceValue)"
                         v-bind:class="'dice dice_' + diceValue + ' stored'" v-bind:value="diceValue"
                         v-bind:style="{visibility: 'visible', pointerEvents: active ? 'unset' : 'none'}">
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div style="" class="col gamecontainer">
       <div class="game">
          <div class="table-container">
             <table class="gameTable" id="gameTable">
                <thead>
                   <tr class="main-heading">
                      <th>
                          <button type="button" id="scrollDown" class="btn btn-block" @click="zoomIntoField">
                            <span class="material-symbols-outlined">expand_content</span>
                          </button>
                          <button type="button" class="btn btn-block" @click="restart">restart</button>
                      </th>
                      <th>
                        <button id="popoverButton" type="button" class="btn btn-dark" data-bs-html="true" data-bs-container="body" 
                        data-bs-toggle="popover" data-bs-title="Available Options" data-bs-placement="bottom" data-bs-trigger="hover" 
                        :data-bs-content="generatePopoverContent()">Available Options</button>
                      </th>
                      <th v-for="i in this.numberOfPlayers">{{this.players[0][i-1].name}}</th>
                   </tr>
                </thead>
                <tr v-for="row in 19">
                    <template v-if="row <= 6">
                        <td><button class="btnAction" @click="writeTo(row)" :disabled="!this.active"><img :src="this.firstColumn[row-1]"></button></td>
                        <td class="secondColumn">{{this.secondColumn[row-1]}}</td>
                    </template>
                    <template v-else-if="(row-1) > 8 && (row-1) < 16">
                        <td><button class="btnAction" @click="writeTo(writeDownMappingsForLowerPart[row-10])" :disabled="!this.active">{{this.firstColumn[row-1]}}</button></td>
                        <td class="secondColumn">{{this.secondColumn[row-1]}}</td>
                    </template>
                    <template v-else>
                         <td>{{this.firstColumn[row-1]}}</td>
                         <template v-if="row === 8">
                            <td class="secondColumn">{{this.secondColumn[row-1]}}</td>
                         </template>
                         <template v-else>
                            <td class="secondColumn"><span class="material-symbols-outlined">arrow_right_alt</span></td>
                         </template>
                    </template>
                    <template v-for="col in this.numberOfPlayers">
                        <template v-if="(col-1) === this.currentPlayer">
                            <td class="activeCol"><span class="cell">{{this.matrix[row-1][col-1]}}</span></td>
                        </template>
                        <template v-else>
                            <td><span class="cell">{{this.matrix[row-1][col-1]}}</span></td>
                        </template>
                    </template>
                </tr>
             </table>
          </div>
       </div>
    </div>
`
});

app.component('lobby', {
    data() {
        return {
            playerID: 0,
            timestamp: 0,
            websocket: undefined,
            playersCount: 0,
            playersReady: 0,
            countdown: 60,
            ready: false,
            isRunning: false,
            yourName: ''
        }

    },
    computed: {
        isJoinButtonDisabled() {

            return this.yourName.trim() === '';
        }
    },
    methods: {
        readyFunction() {
            this.ready = true;
            this.websocket.send(JSON.stringify({event: "ready", playerID: this.playerID}));
        },
        setPlayerInSessionStorage(player, callback) {
            sessionStorage['player'] = JSON.stringify(player);
            if (sessionStorage['player'] === JSON.stringify(player)) {
                callback();
            } else {
                setTimeout(() => {
                    console.log("Failed setting player %o in sessionStorage! Retrying...", player);
                    this.setPlayerInSessionStorage(callback);
                }, 1000);
            }
        },
        connectWebSocket(playerName) {
            const countdown = document.getElementById("countdown");
            this.websocket = new WebSocket("ws://localhost:9000/lobbyWebsocket");
            this.playerName = playerName
            this.websocket.onopen = (event) => {
                this.websocket.send(JSON.stringify({event: "newPlayer", name: playerName}));
                /*$.ajax({
                    method: "GET", url: '/isRunning',
                    success: function (data) {
                      if (data.isRunning) {
                          websocket.send(JSON.stringify({"event": "clearAll"}));
                      }
                    }
                });*/
                console.log("Connected to Websocket");
            }

            this.websocket.onclose = function () {
                console.log('Connection with Websocket Closed!');
            };

            this.websocket.onerror = function (error) {
                console.log('Error in Websocket occurred: ' + error);
            };

            this.websocket.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (data.event === "updateTimeMessageEvent") {
                    this.countdown = (60 - Math.floor(data.time / 1000)).toString()
                    this.playersCount = data.numberOfPlayers;
                    if ((data.readyCount === this.playersCount && this.playersCount > 1) || data.startGame) {
                        this.websocket.send(JSON.stringify({
                            event: "startGame",
                            name: this.playerName,
                            playerID: this.playerID
                        }));
                    }
                } else if (data.event === "newPlayerMessageEvent") {
                    this.playerID = data.id;
                    this.timestamp = data.timestamp;
                    this.playersCount = data.numberOfPlayers;
                    this.playersReady = data.readyCount
                } else if (data.event === "readyMessageEvent") {
                    this.playersReady = data.readyCount
                } else if (data.event === "closeConnectionMessageEvent") {
                    $('#confirmationDialog').modal('hide');
                } else if (data.event === "newGameMessageEvent") {
                    const playerData = {'id': this.playerID, 'name': this.playerName, 'timestamp': this.timestamp};
                    this.setPlayerInSessionStorage(playerData, () => {
                        if (data.isInitiator) {
                            fetch('/new?players=' + data.players).then(() => {
                                window.location.href = '/kniffel'
                            });
                            /*  $.ajax({
                                  method: "GET", url: '/new?players=' + data.players,
                                  success: function () {
                                      window.location.href = '/kniffel';
                                  },
                                  error: function(jqXHR, textStatus, errorThrown) {
                                      console.error("Failed starting new game!");
                                  }
                              });*/
                        } else {
                            window.location.href = '/kniffel';
                        }
                    });
                }
            };
        },
        closeConnection() {
            this.closeSocketConnection().then(() => {
                if (this.ready) {
                    this.ready = false;
                }
            })
        },
        async closeSocketConnection() {
            return new Promise((resolve, reject) => {
                this.websocket.send(JSON.stringify({
                    event: "closeConnection",
                    ready: this.ready,
                    playerID: this.playerID
                }));

                function handleMessage(event) {
                    const response = JSON.parse(event.data);
                    resolve(response);
                }

                this.websocket.addEventListener('message', handleMessage);
            });
        },
        updateGameState() {
            $.ajax({
                url: '/isRunning', method: 'GET', success: function (data) {
                    this.isRunning = data.isRunning
                }
            })
        },
        leaveLobby() {
            this.websocket.send(JSON.stringify({event: "closeConnection", playerID: this.playerID, ready: this.ready}));
        },
        openConfirmationDialog() {
            $('#leaveLobbyConfirmationDialog').modal('show')
        }
    },
    created() {
        this.updateGameState();
    },
    beforeDestroy() {
        this.closeSocketConnection().then(() => {
            return confirm();
        })
    },
    template: `
    <div class="col startGame">
        <div class="col">
            <img style="display: block;
                margin: auto" src="assets/images/flying_dices.png"/>
            <h1 style="text-align: center">Welcome to Kniffel</h1>
            <h3 style="text-align: center;
                margin-bottom: 20px">Let the dice roll</h3>
            <div style="text-align: center">
                <label class="label yourNameLabel" for="yourName">Your Name:</label>
                <input v-model="yourName" class="input" id="yourName" type="text" placeholder="Your Name here" />
                <button :disabled="isJoinButtonDisabled" type="button" data-bs-toggle="modal" data-bs-target="#confirmationDialog"
                  class="startButton btn btn-dark"
                  @click="connectWebSocket(yourName)"
                >
                  Join
                </button>
            </div>
        </div>
    </div>
    <div class="modal fade" id="confirmationDialog" data-bs-backdrop="static" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Waiting for Players...</h5>
                </div>
                <div class="modal-body">
                    <div class="container centering-block">
                        <div class="loader centered">
                            <div class="animationRow">
                                <div class="square square_one"></div>
                                <div class="square square_two"></div>
                                <div class="square square_three"></div>
                            </div>
                            <div class="animationRow">
                                <div class="square square_four"></div>
                                <div class="square square_five"></div>
                                <div class="square square_six"></div>
                            </div>
                            <div class="animationRow">
                                <div class="square square_seven"></div>
                                <div class="square square_eight"></div>
                                <div class="square square_nine"></div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p><span :innerHTML="playersReady"></span><span>/<span :innerHTML="playersCount"></span> Players ready</span></p>
                        <p><span>Seconds until Start: </span><span :innerHTML="countdown"></span></p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-dark" id="ready" @click="readyFunction" :disabled="ready"
                    :style="{ backgroundColor: ready ? 'green' : '', borderColor: ready ? 'green' : '' }" >
                        <span v-if="ready" class="material-symbols-outlined">check</span>
                            Ready
                    </button>
                    <button type="button" class="btn btn-dark" id="leaveLobby" @click="openConfirmationDialog">Leave <span class="material-symbols-outlined">
                        exit_to_app
                    </span></button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="leaveLobbyConfirmationDialog" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Are you sure?</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to leave?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="btnConfirm" @click="leaveLobby">Yes</button>
                    <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="no">No</button>
                </div>
            </div>
        </div>
    </div>
    `
});

app.component('navbar', {
    data() {
        return {
            isRunning: false,
            actionActive: false
        }
    },
    created() {
        this.actionActive = this.isGameRoute()
    },
    updated() {
        this.actionActive = this.isGameRoute()
    },
    methods: {
        isGameRoute() {
            return window.location.href === "/kniffel";
        },
        save() {
            $.ajax({
                url: '/save', method: 'GET',
                error: function () {
                    console.error('Failed to save game.');
                }
            })
        },
        // TODO: undo redo load müssen noch umgebaut werden (load schon angefangen. geht das so überhaupt?)
        load() {
            $.ajax({
                url: '/load', method: 'GET',
                success: (data) => {
                    this.incup = data.controller.dicecup.incup
                    this.remainingDices = data.controller.dicecup.remainingDices
                    this.stored = data.controller.dicecup.stored
                    this.matrix = data.controller.field.rows
                },
                error: function () {
                    console.error('Failed to load game.');
                }
            });
        },
        undo() {
            $.ajax({
                url: '/undo', method: 'GET',
                error: function () {
                    console.error('Failed to undo the last move.');
                }
            });
        },
        redo() {
            $.ajax({
                url: '/redo', method: 'GET',
                error: function () {
                    console.error('Failed to redo the previous move.');
                }
            });
        }
    },
    template: `
         <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container-fluid">
                <a style="display: flex;" class="navbar-brand" href="/">
                    <img style="margin-right: 5px" src="assets/images/6_white.png" width="30" alt="" height="30">
                    Home
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav mr-auto">
                        <li class="nav-item">
                            <a id="actionGame" class="nav-link" href="/kniffel">Game</a>
                        </li>
                        <li id="actions" style="display: none" class="nav-item dropdown" v-if="isGameRoute">
                            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Action
                            </a>
                            <ul class="dropdown-menu bg-dark" aria-labelledby="navbarDropdown">
                                <li><hr class="dropdown-divider"></li>
                                <li><a id="actionLoad" v-bind:disabled="!isRunning" v-on:click="load" class="dropdown-item" href="/kniffel">Load</a></li>
                                <li><a id="actionSave" v-bind:disabled="!isRunning" v-on:click="save" class="dropdown-item" href="/kniffel">Save</a></li>
                                <li><a id="actionUndo" v-bind:disabled="!isRunning" v-on:click="undo" class="dropdown-item" href="/kniffel">Undo</a></li>
                                <li><a id="actionRedo" v-bind:disabled="!isRunning" v-on:click="redo" class="dropdown-item" href="/kniffel">Redo</a></li>
                            </ul>
                        </li>
                    </ul>
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="/about">About</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    `
})
;


app.component('chat', {
    data() {
        return {
            chatActive: false,
            messages: []
        }
    },
    updated() {
        this.chatActive = this.isGameRoute()
    },
    methods: {
        isGameRoute() {
            console.log("here")
            return window.location.href === '/kniffel';
        },
        refreshChat() {
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
                    this.messages = data.messages;
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

    },
    template: `
        <div style="display: none" class="chatContainer" id="chatContainer">
            <div>
                <div class="col-6">
                    <div id="chatroom">
                        <button id="chatClose" style="float: right" type="button" class="btn-close" aria-label="Close"></button>
                        <h1>Chat-Room</h1>

                        <form action="#" id="comment-form">
                            <div class="form-group">
                                <label for="your-message">Your comment</label>
                                <textarea type="text" name="content" id="your-message" class="form-control" placeholder="Here is my message.."></textarea>
                            </div>
                            <input style="margin-top: 10px" type="submit" value="Send" class="btn btn-light" id="submit">
                        </form>

                        <div id="messages">
                            <ul class="list-unstyled" id="list">
                                <li v-for="message in messages" :key="message.id">
                                    {{ message.content }} (posted <span class="date">{{ calculateMinutesAgo(message.created_at) }} minutes ago</span>) by {{ message.author }}
                                </li>
                            </ul>
                            <button class="btn btn-light" @click="refreshChat">
                                <span class="material-symbols-outlined">refresh</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <button class="btn btn-dark" id="chatButton" @click="">
            <span class="material-symbols-outlined">chat</span>
        </button>
   
    `
})

app.mount('#container');


function buildField() {
    $.ajax({
        url: '/field', type: 'GET', success: function (data) {
            buildTableFromJson(data)
        }, error: function () {
            console.error('Failed to build Table from JSON.');
        }
    })
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
            this.websocket.send(JSON.stringify({event: "refreshChats"}));
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

/*
$(document).ready(function () {
    // field popover
    bootstrap.Popover.Default.allowList.table = [];
    bootstrap.Popover.Default.allowList.thead = [];
    bootstrap.Popover.Default.allowList.tbody = [];
    bootstrap.Popover.Default.allowList.tr = [];
    bootstrap.Popover.Default.allowList.td = [];

    const thScrollDown = document.getElementById('scrollDown');
    thScrollDown.onclick = function () {
        document.querySelector('.table-container').scrollIntoView();
    }
});
 */

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



