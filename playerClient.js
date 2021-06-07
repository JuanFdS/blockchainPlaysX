const { getRunInstanceClient, getRunInstanceClient2 } = require("./main.js");
const Run = require("run-sdk");

let codeRepoLocation = 'a7d798ca9433d11056da79f3d95effba6819e6173c152c6e76898c8b2a867166_o1';

class PlayerClient {
    constructor(runInstance) {
        this.runInstance = runInstance;
        this.classesLocations = null;
    }
    //
    // async createPlayer(gameOwner) {
    //     const runInstance = getRunInstanceClient();
    //     const Player = await runInstance.load(gameOwner.classesLocations.player);
    //
    //     const juan = new Player();
    //     juan.setName("juan");
    //     await juan.sync();
    //     this.player = juan;
    // }

    // async askToJoinGame(gameOwner) {
    //     const runInstance = getRunInstanceClient();
    //
    //     const game = await runInstance.load(gameOwner.gameLocation);
    //     const juan = await this.player.sync();
    //
    //     const joinTx = new Run.Transaction();
    //     joinTx.update(() => game.join(juan));
    //
    //     return await joinTx.export();
    // }
    async getClassFor(className) {
        if (this.classesLocations === null) {
            const CodeRepo = await this.runInstance.load(codeRepoLocation);
            await CodeRepo.sync();
            this.classesLocations = CodeRepo.locations;
        }
        return await this.runInstance.load(this.classesLocations[className]);
    }

    async sendInvitation(game) {
        const InvitationRequest = await this.getClassFor("InvitationRequest");
        const invitation = new InvitationRequest(this.runInstance.owner.address, game);
        await invitation.sync();
        return invitation.location
    }

    async deployCharacter(xPosition) {
        await this.runInstance.inventory.sync();
        const J = await this.getClassFor("Joystick");
        const joystick = this.runInstance.inventory.jigs.filter(j => j instanceof J)[0];
        await joystick.sync();
        joystick.deployHero(xPosition);
        await joystick.sync();
    }

    async destroyInstances() {
        await this.runInstance.inventory.sync();
        await Promise.all(this.runInstance.inventory.jigs.map(j => j.destroy()));
    }

    async destroyAll() {
        await this.runInstance.inventory.sync();
        await Promise.all(this.runInstance.inventory.jigs.map(j => j.destroy()));
        await Promise.all(this.runInstance.inventory.code.map(j => j.destroy()));
    }
}


module.exports = {
    PlayerClient
}