import {newRandomOwner, getRunInstance} from "./main.js";
import Run from "run-sdk";

export class PlayerOwner {
    constructor() {
        this.owner = newRandomOwner();
    }

    async createPlayer(gameOwner) {
        const runInstance = getRunInstance(this.owner);
        const Player = await runInstance.load(gameOwner.classesLocations.player);

        const juan = new Player();
        juan.setName("juan");
        await juan.sync();
        this.player = juan;
    }

    async askToJoinGame(gameOwner) {
        const runInstance = getRunInstance(this.owner);

        const game = await runInstance.load(gameOwner.gameLocation);
        const juan = await this.player.sync();

        const joinTx = new Run.Transaction();
        joinTx.update(() => game.join(juan));

        return await joinTx.export();
    }
}