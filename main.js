
const gameOwner = new Run({network: 'mock'}).owner;
const playerOwner = new Run({network: 'mock'}).owner;
let playerClassLocation = null;
let pepitaGameLocation = null;
let rawTx = null;

async function createGameAndPlayerClass() {
    const runOwner = new Run({network: 'mock', owner: gameOwner});

    const RUNNING_STATUS = 'RUNNING';
    const END_STATUS = 'END';

    const UP = 'UP';
    const DOWN = 'DOWN';
    const LEFT = 'LEFT';
    const RIGHT = 'RIGHT';

    class Player extends Jig {
        init() {
            this.position_x = 0;
            this.position_y = 0;
        }

        setName(playerName) {
            expect(playerName).toBeString();
            this.playerName = playerName;
        }

        move(direction) {
            expect(direction).toBeString();
            switch (direction) {
                case UP: this.position_y++; break;
                case DOWN: this.position_y--; break;
                case LEFT: this.position_x--; break;
                case RIGHT: this.position_x++; break;
            }
        }
    }
    Player.deps = {UP, DOWN, LEFT, RIGHT, expect: Run.extra.expect}

    class Game extends Jig {
        init() {
            this.players = [];
        }

        begin(gameName, numberOfPlayers) {
            expect(gameName).toBeString();
            expect(numberOfPlayers).toBeNumber();
            this.gameName = gameName;
            this.numberOfPlayers = numberOfPlayers;
            this.status = RUNNING_STATUS;
        }

        join(player) {
            expect(player).toBeInstanceOf(Player)
            if (this.numberOfPlayers > this.players.length && this.status === RUNNING_STATUS) {
                this.players.push(player);
            }
        }

        endGame() {
            this.status = END_STATUS;
        }
    }

    Game.deps = {RUNNING_STATUS, END_STATUS, expect: Run.extra.expect, Player}

    const pepitaGame = new Game();
    pepitaGame.begin("pepita", 1);
    await pepitaGame.sync();
    // await Game.sync();
    console.log("The game is afoot!");

    await runOwner.deploy(Player);
    playerClassLocation = Player.location;
    pepitaGameLocation = pepitaGame.location;
    // await Player.sync();
    console.log("Who will be the first challenger?");
}

async function createPlayerAndJoin() {
    const runPlayer = new Run({network: 'mock', owner: playerOwner});

    runPlayer.trust("*");
    const Player = await runPlayer.load(playerClassLocation);

    const juan = new Player();
    juan.setName("juan");
    await juan.sync();

    const joinTx = new Run.Transaction();
    const pepitaGame = await runPlayer.load(pepitaGameLocation);
    joinTx.update(() => pepitaGame.join(juan));

    const result = await joinTx.export();
    console.log("Exportado " + result);
    rawTx = result;
}

async function acceptPlayerJoining() {
    const runOwner2 = new Run({network: 'mock', owner: gameOwner});
    runOwner2.trust("*");
    const playerWantsToJoinTx = await runOwner2.import(rawTx)

    if (playerWantsToJoinTx.outputs.length) {
        console.log("output: ", playerWantsToJoinTx.outputs);
    }

    const result = await playerWantsToJoinTx.publish({ pay: false });
    console.log("Publicado " + result);
}


// juan.move(UP);
