const { getRunInstanceServer } = require("./main.js");
const { InvitationRequest, Joystick, Turn, Game, Pawn, Hero, Prize} = require("./jigs.js");

const CLASES = [InvitationRequest, Joystick, Turn, Game, Pawn, Hero, Prize];

async function deployGameClasses(run) {
    await Promise.all(CLASES.map(c => {
        run.deploy(c)
        console.log(`Deploya3 clase: ${c.name}`)
    }))
    await run.sync();
}

class GameServer {
    constructor() {
        this.runInstance = getRunInstanceServer();
    }

    async loadClasses() {
        this.classesLocations = {}
        await this.runInstance.inventory.sync();
        this.runInstance.inventory.code.forEach(c => {
            this.classesLocations[c.name] = c;
        })
    }

    async resetearYEmpezarDeNuevo() {
        await this.destroyAll()
        await this.deployClasses()
        await this.beginGame()
    }

    async deployClasses() {
        await deployGameClasses(this.runInstance);
        await this.loadClasses();
    }

    async beginGame() {
        const Game = this.classesLocations.Game;
        await Game.sync()
        const pepitaGame = Game.createGame();
        pepitaGame.begin("pepita", 1);
        await pepitaGame.sync();
        this.gameLocation = pepitaGame.location;
    }

    async approveInvitations() {
        await this.runInstance.inventory.sync();
        const I = this.classesLocations.InvitationRequest;
        const game = await this.currentGame();
        const joysticks = await Promise.all(
            this.runInstance.inventory.jigs.filter(jig => jig instanceof I).map(i => i.sendJoystick(game))
        );
        await game.sync();
        await Promise.all(joysticks.map(j => j.sync()));
    }

    async destroyInstances() {
        await this.runInstance.inventory.sync();
        this.classesLocations.Game.removeAllGames();
        await Promise.all(this.runInstance.inventory.jigs.map(j => j.destroy()));
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