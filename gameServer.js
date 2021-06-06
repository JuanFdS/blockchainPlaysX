const { getRunInstanceClient, getRunInstanceServer, setRunServer } = require("./main.js");
const Run = require("run-sdk");

const RUNNING_STATUS = 'RUNNING';
const END_STATUS = 'END';

const UP = 'UP';
const DOWN = 'DOWN';
const LEFT = 'LEFT';
const RIGHT = 'RIGHT';
const MAP_LENGTH = 20;
const MAP_WIDTH = 8;

class Joystick extends Jig {
    init(game) {
        this.commands = [];
        this.game = game;
    }

    send(player) {
        expect(player).toBeString();
        this.owner = player;
    }

    press(action) {
        this.commands.push({ action: action, turn: this.game.currentTurn })
    }
}
Joystick.deps = { expect: Run.extra.expect }
Joystick.metadata = { emoji: '🕹️' }

class Turn extends Jig {}

Turn.metadata = { emoji: '⌛' }


class Character extends Jig {
    init(health, direction) {
        this.direction = direction
        this.position = { x: 0, y: this.goingUp() ? MAP_LENGTH : 0 }
        this.health = health
    }

    goingUp() {
        return this.direction == "UP"
    }

    tick() {
        if(this.goingUp()) {
            this.position.y -= 1
        } else {
            this.position.y += 1
        }
    }
}

Character.metadata = { emoji: '🤺' }
Character.deps = { MAP_LENGTH }

class Game extends Jig {
    init() {
        this.reset()
    }

    reset() {
        this.players = [];
        this.joystick = [];
        this.characters = [];
    }

    currentTurn() {
        return this.currentTurn;
    }

    begin(gameName, numberOfPlayers) {
        expect(gameName).toBeString();
        expect(numberOfPlayers).toBeNumber();
        this.gameName = gameName;
        this.numberOfPlayers = numberOfPlayers;
        this.status = RUNNING_STATUS;
        this.currentTurn = new Turn();
    }

    add(joystick) {
        expect(joystick).toBeInstanceOf(Joystick);
        this.joystick.push(joystick);
        this.characters.push(new Character(100, "UP"));
    }

    nextTurn() {
        this.currentTurn = new Turn();
    }

    tick() {
        this.characters.forEach(character => character.tick());
        this.nextTurn();
    }

    endGame() {
        this.status = END_STATUS;
    }
}

Game.deps = { MAP_LENGTH, RUNNING_STATUS, END_STATUS, expect: Run.extra.expect, Joystick, Turn, Character }
Game.metadata = { emoji: '👾' }


const SERVER_OWNER = "mj1WZ8wTimESFzLgio12iG55M5dYR16PwR"
class InvitationRequest extends Jig {
    sendInvitation() {
        this.player = this.owner;
        this.owner = SERVER_OWNER;
    }

    sendJoystick(game) {
        expect(game).toBeInstanceOf(Game);
        const joystick = new Joystick(game);
        game.add(joystick);
        joystick.send(this.player);
        return joystick;
    }
}

InvitationRequest.metadata = { emoji: '📨' }

InvitationRequest.deps = { SERVER_OWNER, Joystick, Game, expect: Run.extra.expect }

// setRunServer().then(() => console.log("Run setea3 a server"))
const CLASES = [Character, InvitationRequest, Joystick, Turn, Game];

async function deployGameClasses(run) {
    await Promise.all(CLASES.map(c => {
        run.deploy(c)
        console.log(`Deploya3 clase: ${c.name}`)
    }))
    await run.sync();

    return {
        game: Game.location,
        invitationRequest: InvitationRequest.location,
        joystick: Joystick.location,
        turn: Turn.location,
    };
}

class GameServer {
    constructor() {
    }

    async resetearYEmpezarDeNuevo() {
        await this.destroyAll()
        await this.deployClasses()
        await this.beginGame()
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
}