const {getRunInstanceClient} =  require("./main.js");
const Run = require("run-sdk");

const INVITATION_REQUEST = "3c3a4de9380a22a81f817a6962a5d45b39f25690475528dab433ab39ba0c4100_o1"

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