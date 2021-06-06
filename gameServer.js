const { getRunInstanceClient, getRunInstanceServer, setRunServer } = require("./main.js");
const Run = require("run-sdk");

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
            case UP:
                this.position_y++;
                break;
            case DOWN:
                this.position_y--;
                break;
            case LEFT:
                this.position_x--;
                break;
            case RIGHT:
                this.position_x++;
                break;
        }
    }
}

Player.deps = { UP, DOWN, LEFT, RIGHT, expect: Run.extra.expect }
Player.metadata = { emoji: '⚔️' }

class Joystick extends Jig {
    init() {
        this.commands = []
    }

    send(player) {
        expect(player).toBeString();
        this.owner = player;
    }

    press(action) {
        this.commands.push({ action: action, timestamp: new Date().toISOString() })
    }

    actionsSince(moment) {
        return this.commands.map(({ action, timestamp }) => ({ action, timestamp: new Date(timestamp) }))
            .filter(({ action, timestamp }) => timestamp > moment)
    }
}
Joystick.deps = { expect: Run.extra.expect }
Joystick.metadata = { emoji: '🕹️' }

class Game extends Jig {
    init() {
        this.reset()
    }

    reset() {
        this.players = [];
        this.joystick = [];
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

    add(joystick) {
        expect(joystick).toBeInstanceOf(Joystick);
        this.joystick.push(joystick);
    }

    endGame() {
        this.status = END_STATUS;
    }
}
Game.deps = { RUNNING_STATUS, END_STATUS, expect: Run.extra.expect, Player, Joystick }
const SERVER_OWNER = "mj1WZ8wTimESFzLgio12iG55M5dYR16PwR"
class InvitationRequest extends Jig {
    sendInvitation() {
        this.player = this.owner;
        this.owner = SERVER_OWNER;
    }

    sendJoystick(game) {
        expect(game).toBeInstanceOf(Game);
        const joystick = new Joystick();
        game.add(joystick);
        joystick.send(this.player);
        return joystick;
    }
}

InvitationRequest.deps = { SERVER_OWNER, Joystick, Game, expect: Run.extra.expect }

// setRunServer().then(() => console.log("Run setea3 a server"))

async function deployGameClasses(run) {
    await run.deploy(Player);
    await run.deploy(Joystick);
    await run.deploy(Game);
    await run.deploy(InvitationRequest);
    await run.sync();
    console.log("Classes deployed", Player, Joystick, Game, InvitationRequest);
    
    return {
        player: Player.location,
        game: Game.location,
        invitationRequest: InvitationRequest.location,
        joystick: Joystick.location
    };
}

class GameServer {
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

    async approveInvitations() {
        const runInstance = getRunInstanceServer();
        await runInstance.inventory.sync();
        const I = await runInstance.load(this.classesLocations.invitationRequest);
        const game = await this.currentGame();
        const joysticks = await Promise.all(
            runInstance.inventory.jigs.filter(jig => jig instanceof I).map(i => i.sendJoystick(game))
        );
        await game.sync();
        await Promise.all(joysticks.map(j => j.sync()));
    }

    async destroyAll() {
        const runInstance = getRunInstanceServer();

        await runInstance.inventory.sync();
        await Promise.all(runInstance.inventory.jigs.map(j => j.destroy()));
        await Promise.all(runInstance.inventory.code.map(j => j.destroy()));
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