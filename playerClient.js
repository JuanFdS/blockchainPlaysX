const { getRunInstanceClient, getRunInstanceClient2 } = require("./main.js");
const Run = require("run-sdk");

let INVRQ_CLASS_LOCATION = "31aa49bf375959d9385b631a4935bc9044dece869e6d2e070fa75bee9ddade6d_o1"
let JOYSTICK_CLASS_LOCATION = "31aa49bf375959d9385b631a4935bc9044dece869e6d2e070fa75bee9ddade6d_o3"

class PlayerClient {
    constructor(runInstance) {
        this.runInstance = runInstance;
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

    async sendInvitation() {
        const InvitationRequest = await this.runInstance.load(INVRQ_CLASS_LOCATION);
        const invitation = new InvitationRequest();
        await invitation.sync();
        invitation.sendInvitation();
        await invitation.sync();
    }

    async deployCharacter(xPosition) {
        await this.runInstance.inventory.sync();
        const J = await this.runInstance.load(JOYSTICK_CLASS_LOCATION);
        const joystick = this.runInstance.inventory.jigs.filter(j => j instanceof J)[0];
        await joystick.sync();
        joystick.deployCharacter(xPosition);
        await joystick.sync();
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