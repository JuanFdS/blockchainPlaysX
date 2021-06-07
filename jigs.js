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

class Pawn extends Jig {
    init(direction, column, hero) {
        this.direction = direction
        this.position = {x: column, y: this.goingUp() ? MAP_LENGTH : 0}
        this.health = hero.health
        this.originalHero = hero
    }

    send(gameOwner) {
        this.owner = gameOwner;
    }

    goingUp() {
        return this.direction === "UP"
    }

    tick(attacksOnSelf) {
        let notAttacked = !(attacksOnSelf.length === 0);
        if (notAttacked) {
            if (this.goingUp()) {
                this.position.y = this.position.y - 1;
            } else {
                this.position.y = this.position.y + 1;
            }
        } else {
            attacksOnSelf.forEach(damage => {
                this.health = this.health - damage;
            })
        }
    }

    isNearTo(opponent) {
        return this.position.x === opponent.position.x && this._abs(this.position.y - opponent.position.y) <= 1;
    }

    getAttack() {
        return this.originalHero.offensivePower()
    }

    _abs(x) {
        expect(x).toBeNumber();
        return (x < 0) ? (-x) : x
    }
}

Pawn.metadata = {emoji: '️♟️'}
Pawn.deps = {expect: Run.extra.expect, MAP_LENGTH}

class Prize extends Jig {
    init(experience) {
        expect(experience).toBeNumber();
        this.experience = experience
        this.usado = false
    }

    consumePrize() {
        this.usado = true
    }
}

Prize.deps = { expect: Run.extra.expect }
Prize.metadata = { emoji: '🏆' }

class Hero extends Jig {
    init(name, stats) {
        this.name = name
        this.experience = 0
        this.strength = stats.strength
        this.speed = stats.speed
        this.health = stats.health
    }

    consumePrize(prize) {
        expect(prize).toBeInstanceOf(Prize)
        if (! prize.usado) {
            prize.consumePrize();
            this.experience = this.experience + prize.experience
        }
    }

    level() {
        return parseInt(this.experience / 100)
    }

    offensivePower() {
        return this.strength + (level / 3)
    }
}

Hero.metadata = {emoji: '🦸'}
Hero.deps = {expect: Run.extra.expect, Prize }

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

    deployHero(hero, column) {
        this.commands.push({hero, column, turn: this.game.currentTurn})
    }
}

Joystick.deps = { expect: Run.extra.expect }
Joystick.metadata = {emoji: '🕹️'}

class Turn extends Jig {
}

Turn.metadata = {emoji: '⌛'}

class Game extends Jig {
    init() {
        expect(caller).toBe(Game)
        this.reset()
    }

    static removeFinishedGames() {
        this.all = this.all.filter(g => g.isFinished())
    }

    static removeAllGames() {
        this.all = [];
    }

    static createGame() {
        const newGame = new Game();
        this.all.push(newGame);
        return newGame;
    }

    isFinished() {
        return this.status !== RUNNING_STATUS;
    }

    reset() {
        this.players = [];
        this.joysticks = [];
        this.pawns = [];
        this.nextTeam = 'UP';
    }

    begin(gameName, numberOfPlayers) {
        expect(gameName).toBeString();
        expect(numberOfPlayers).toBeNumber();
        this.gameName = gameName;
        this.numberOfPlayers = numberOfPlayers;
        this.status = RUNNING_STATUS;
        this.winner = null;
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
        if (this.status !== RUNNING_STATUS) {
            return
        }
        this.joysticks.forEach(j => {
            j.commands.filter(command => command.turn === this.currentTurn).forEach(command => {
                this.pawns.push(new Pawn(j.team, command.column, command.hero));
            });
        });

        const goingUp = this.pawns.filter(p => p.goingUp());
        const goingDown = this.pawns.filter(p => !p.goingUp());
        let attacksOn = {};
        goingUp.forEach(pUp => {
            const enemiesNear = goingDown.filter(pDw => pUp.isNearTo(pDw));
            attacksOn[pUp] = enemiesNear.map(x => x.getAttack());
        })
        goingDown.forEach(pDw => {
            const enemiesNear = goingUp.filter(pUp => pDw.isNearTo(pUp));
            attacksOn[pDw] = enemiesNear.map(x => x.getAttack());
        })
        this.pawns.forEach(p => p.tick(attacksOn[p]));
        this.pawns = this.pawns.filter(p => p.health > 0);

        const champions = this.pawns.filter(p => p.won())
        if (champions.length > 0) {
            const upChampions = champions.filter(p => p.direction === 'UP');
            const downChampions = champions.filter(p => p.direction === 'DOWN');

            if (upChampions.length > downChampions.length) {
                this.winner = 'UP'
                this.endGame()
                return
            }
            if (upChampions.length < downChampions.length) {
                this.winner = 'DOWN'
                this.endGame()
                return
            }
        }

        this.nextTurn();
    }

    endGame() {
        this.status = END_STATUS;
    }
}

Game.deps = {MAP_LENGTH, RUNNING_STATUS, END_STATUS, expect: Run.extra.expect, Joystick, Turn, Pawn};
Game.all = [];
Game.metadata = {emoji: '👾'}

class InvitationRequest extends Jig {
    init(player, game) {
        this.player = player;
        this.owner = SERVER_OWNER;
        this.game = game;
    }

    sendJoystick() {
        const joystick = new Joystick(this.game, this.game.getAndSwapNextTeam());
        this.game.add(joystick);
        joystick.send(this.player);
        return joystick;
    }
}

InvitationRequest.metadata = {emoji: '📨'}

InvitationRequest.deps = {SERVER_OWNER, Joystick, Game, expect: Run.extra.expect}

class CodeRepo extends Jig {
    static mergeLocations(newLocations) {
        this.locations = {...this.locations, ...newLocations};
    }
}

CodeRepo.locations = {}

module.exports = {
    CodeRepo, Prize, Hero, Pawn, InvitationRequest, Joystick, Turn, Game
}