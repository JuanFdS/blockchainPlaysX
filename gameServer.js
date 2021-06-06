const { getRunInstanceServer } = require("./main.js");
const { Character, InvitationRequest, Joystick, Turn, Game } = require("./jigs.js");

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
        this.runInstance = getRunInstanceServer();
    }

    async resetearYEmpezarDeNuevo() {
        await this.destroyAll()
        await this.deployClasses()
        await this.beginGame()
    }

    async deployClasses() {
        this.classesLocations = await deployGameClasses(this.runInstance);
    }

    async beginGame() {
        const Game = await this.runInstance.load(this.classesLocations.game);
        const pepitaGame = new Game();
        pepitaGame.begin("pepita", 1);
        await pepitaGame.sync();
        this.gameLocation = pepitaGame.location;
    }

    async approveInvitations() {
        await this.runInstance.inventory.sync();
        const I = await this.runInstance.load(this.classesLocations.invitationRequest);
        const game = await this.currentGame();
        const joysticks = await Promise.all(
            this.runInstance.inventory.jigs.filter(jig => jig instanceof I).map(i => i.sendJoystick(game))
        );
        await game.sync();
        await Promise.all(joysticks.map(j => j.sync()));
    }

    async destroyAll() {
        await this.runInstance.inventory.sync();
        await Promise.all(this.runInstance.inventory.jigs.map(j => j.destroy()));
        await Promise.all(this.runInstance.inventory.code.map(j => j.destroy()));
    }

    async currentGame() {
        const currentGame = await this.runInstance.load(this.gameLocation);
        return await currentGame.sync();
    }

    async tickGame() {
        const game = await this.currentGame();
        game.tick();
        await game.sync();
    }
}

gs = new GameServer();