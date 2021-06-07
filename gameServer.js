const { getRunInstanceServer } = require("./main.js");
const { CodeRepo, InvitationRequest, Joystick, Turn, Game, Pawn, Hero, Prize} = require("./jigs.js");

let codeRepoLocation = 'c2107dabfb8b9fa24df6a1bd2a5a0a7d68176522740ace43b878235a60692203_o1';
const CLASES = [InvitationRequest, Joystick, Turn, Game, Pawn, Hero, Prize];

async function deployGameClasses(run, codeRepo) {
    const deployedClasses = await Promise.all(CLASES.map(c => {
        const promise = run.deploy(c)
        console.log(`Deploya3 clase: ${c.name}`)
        return promise;
    }))
    await run.sync();
    const classesLocations = {};
    deployedClasses.forEach(c => { classesLocations[c.name] = c.location; });
    codeRepo.mergeLocations(classesLocations);
    await codeRepo.sync();
    return codeRepo.locations;
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
        let CodeRepoDeployed;
        if (codeRepoLocation === null) {
            CodeRepoDeployed = await this.runInstance.deploy(CodeRepo);
            await this.runInstance.sync();
            codeRepoLocation = CodeRepoDeployed.location;
        } else {
            CodeRepoDeployed = await this.runInstance.load(codeRepoLocation);
            await CodeRepoDeployed.sync();
            await this.runInstance.sync();
        }
        await deployGameClasses(this.runInstance, CodeRepoDeployed);
        await this.loadClasses();
    }

    async beginGame() {
        const Game = this.classesLocations.Game;
        await Game.sync()
        const pepitaGame = Game.createGame();
        pepitaGame.begin(`pepita ${new Date().toString()}`, 1);
        await pepitaGame.sync();
        this.gameLocation = pepitaGame.location;
    }

    async approveInvitations() {
        await this.runInstance.inventory.sync();
        const I = this.classesLocations.InvitationRequest;
        const game = await this.currentGame();
        await game.sync();

        for(const i of this.runInstance.inventory.jigs.filter(jig => jig instanceof I)) {
            await i.sync();
            if(!i.used) {
                const j = i.sendJoystick();
                await j.sync();
                await i.sync();
                await game.sync();
            }

        }
    }

    async destroyInstances() {
        await this.runInstance.inventory.sync();
        this.classesLocations.Game.removeAllGames();
        await Promise.all(this.runInstance.inventory.jigs.map(j => j.destroy()));
    }

    async destroyAll() {
        await this.runInstance.inventory.sync();
        await Promise.all(this.runInstance.inventory.jigs.map(j => j.destroy()));
        await Promise.all(this.runInstance.inventory.code.filter(c => c.name !== 'CodeRepo').map(j => j.destroy()));
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