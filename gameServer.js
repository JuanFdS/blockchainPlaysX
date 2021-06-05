import {getRunInstanceServer} from "./main.js";
import Run from "run-sdk";

export async function deployGameClasses(runInstance) {
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
    Player.metadata = { emoji: '⚔️' }

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

        crearInvitacion() {
            
        }

        jugarCartita(player) {
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

    await runInstance.deploy(Player);
    await runInstance.deploy(Game);
    await runInstance.sync();
    console.log("Classes deployed", Player, Game);

    return {
        player: Player.location,
        game: Game.location
    };
}

export class GameServer {
    constructor() {
    }

    async deployClasses() {
        const runInstance = getRunInstanceServer();
        this.classesLocations = await deployGameClasses(runInstance);
    }

    async beginGame() {
        const runInstance = getRunInstanceServer();

        const Game = await runInstance.load(this.classesLocations.game);
        const pepitaGame = new Game();
        pepitaGame.begin("pepita", 1);
        await pepitaGame.sync();
        this.gameLocation = pepitaGame.location;
    }

    async currentGame() {
        const runInstance = getRunInstanceServer();

        const currentGame = await runInstance.load(this.gameLocation);
        return await currentGame.sync();
    }

    async acceptPlayer(rawTx) {
        const runInstance = getRunInstanceServer();
        const playerWantsToJoinTx = await runInstance.import(rawTx);

        if (playerWantsToJoinTx.outputs.length) {
            console.log("output: ", playerWantsToJoinTx.outputs);
        }

        return await playerWantsToJoinTx.publish({ pay: false });
    }
}