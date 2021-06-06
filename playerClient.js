const {getRunInstanceClient} =  require("./main.js");
const Run = require("run-sdk");

const INVITATION_REQUEST = "2c4a1bdc04ab9e164bc978ca0d9772223cec152ead8cb4249c5a4d8056631638_o1"

class PlayerClient {
    constructor() {
    }

    async createPlayer(gameOwner) {
        const runInstance = getRunInstanceClient();
        const Player = await runInstance.load(gameOwner.classesLocations.player);

        const juan = new Player();
        juan.setName("juan");
        await juan.sync();
        this.player = juan;
    }

    async askToJoinGame(gameOwner) {
        const runInstance = getRunInstanceClient();

        const game = await runInstance.load(gameOwner.gameLocation);
        const juan = await this.player.sync();

        const joinTx = new Run.Transaction();
        joinTx.update(() => game.join(juan));

        return await joinTx.export();
    }

    async sendInvitation(invitationRequestLocation) {
        const runInstance = getRunInstanceClient();

        const InvitationRequest = await runInstance.load(invitationRequestLocation);
        const invitation = new InvitationRequest();
        await invitation.sync();
        invitation.sendInvitation();
        await invitation.sync();
    }

    async destroyAll() {
        const runInstance = getRunInstanceClient();

        await runInstance.inventory.sync();
        await Promise.all(runInstance.inventory.jigs.map(j => j.destroy()));
        await Promise.all(runInstance.inventory.code.map(j => j.destroy()));
    }

    async movePlayer(direction) {
        const runInstance = getRunInstanceClient();

        await this.player.sync();
        this.player.move(direction);
    }
}