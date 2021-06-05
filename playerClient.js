import {getRunInstanceClient} from "./main.js";
import Run from "run-sdk";

export class PlayerClient {
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

    async movePlayer(direction) {
        const runInstance = getRunInstanceClient();

        await this.player.sync();
        this.player.move(direction);
    }
}