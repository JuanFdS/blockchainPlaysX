const Run = require("run-sdk");

const RUNNING_STATUS = 'RUNNING';
const END_STATUS = 'END';

const UP = 'UP';
const DOWN = 'DOWN';
const LEFT = 'LEFT';
const RIGHT = 'RIGHT';
const MAP_LENGTH = 20;
const MAP_WIDTH = 8;
const SERVER_OWNER = "mj1WZ8wTimESFzLgio12iG55M5dYR16PwR"

class Character extends Jig {
    init(health, direction, xPosition) {
        this.direction = direction
        this.position = {x: xPosition, y: this.goingUp() ? MAP_LENGTH : 0}
        this.health = health
    }

    send(gameOwner) {
        this.owner = gameOwner;
    }

    goingUp() {
        return this.direction === "UP"
    }

    tick(engagedOnBattle) {
        if (!engagedOnBattle.includes(this)) {
            if (this.goingUp()) {
                this.position.y = this.position.y - 1;
            } else {
                this.position.y = this.position.y + 1;
            }
        } else {
            this.health = this.health - 10;
        }
    }

    isNearTo(opponent) {
        return this.position.x === opponent.position.x && Math.abs(this.position.y - opponent.position.y) <= 1;
    }
}

Character.metadata = {emoji: '🤺'}
Character.deps = {MAP_LENGTH}

class Joystick extends Jig {
    init(game, team) {
        this.commands = [];
        this.game = game;
        this.team = team;
    }

    send(player) {
        expect(player).toBeString();
        this.owner = player;
    }

    deployCharacter(xPosition) {
        const character = new Character(100, this.team, xPosition);
        character.send(SERVER_OWNER);
        this.commands.push({character, turn: this.game.currentTurn})
    }
}

Joystick.deps = {expect: Run.extra.expect, SERVER_OWNER, Character}
Joystick.metadata = {emoji: '🕹️'}

class Turn extends Jig {
}

Turn.metadata = {emoji: '⌛'}

class Game extends Jig {
    init() {
        this.reset()
    }

    reset() {
        this.players = [];
        this.joysticks = [];
        this.characters = [];
        this.nextTeam = 'UP';
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
        this.joysticks.push(joystick);
    }

    getAndSwapNextTeam() {
        const team = this.nextTeam;
        if (team === 'UP') {
            this.nextTeam = 'DOWN';
        } else {
            this.nextTeam = 'UP';
        }
        return team;
    }

    nextTurn() {
        this.currentTurn = new Turn();
    }

    tick() {
        this.joysticks.forEach(j => {
            j.commands.filter(command => command.turn === this.currentTurn).forEach(command => {
                this.characters.push(command.character);
            });
        });
        const goingUp = this.characters.filter(ch => ch.goingUp());
        const goingDown = this.characters.filter(ch => !ch.goingUp());
        let engagedOnBattle = [];
        goingUp.forEach(chUp => {
            const enemiesNear = goingDown.filter(chDw => chUp.isNearTo(chDw));
            if (enemiesNear.length > 0) {
                engagedOnBattle = [...engagedOnBattle, ...enemiesNear, chUp]
            }
        })
        this.characters.forEach(character => character.tick(engagedOnBattle));
        this.characters = this.characters.filter(character => character.health > 0);
        this.nextTurn();
    }

    endGame() {
        this.status = END_STATUS;
    }
}

Game.deps = {MAP_LENGTH, RUNNING_STATUS, END_STATUS, expect: Run.extra.expect, Joystick, Turn}
Game.metadata = {emoji: '👾'}

class InvitationRequest extends Jig {
    sendInvitation() {
        this.player = this.owner;
        this.owner = SERVER_OWNER;
    }

    sendJoystick(game) {
        expect(game).toBeInstanceOf(Game);
        const joystick = new Joystick(game, game.getAndSwapNextTeam());
        game.add(joystick);
        joystick.send(this.player);
        return joystick;
    }
}

InvitationRequest.metadata = {emoji: '📨'}

InvitationRequest.deps = {SERVER_OWNER, Joystick, Game, expect: Run.extra.expect}

module.exports = {
    Character, InvitationRequest, Joystick, Turn, Game
}