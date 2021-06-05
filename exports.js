import { GameServer } from "./gameServer.js";
import { PlayerClient } from "./playerClient.js";


async function main() {
    const gameServer = new GameServer();
    await gameServer.deployClasses();

    await gameServer.beginGame();
    const playerClient = new PlayerClient();
    await playerClient.createPlayer(gameServer);
    const trx = await playerClient.askToJoinGame(gameServer);

    await gameServer.acceptPlayer(trx);

    return {
        server: gameServer,
        client: playerClient
    };
}

export default { main };
