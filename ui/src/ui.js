
export function getRun() {
    const runConfig = localStorage.getItem('runConfig') ;
    if(runConfig) {
        let run = null
        try {
            run = new Run(JSON.parse(runConfig));
        } catch (e) {
            localStorage.removeItem('runConfig')
            throw e
        }
        run.trust('*')
        window.run = run
        return run
    } else {
        let run = new Run({ network: 'test' })
        run.trust('*')
        window.run = run
        return run
    }
}

let servidor = {
    run: getRun()
}

const codeRepoLocation =
  localStorage.getItem("repoLocation") || "c2107dabfb8b9fa24df6a1bd2a5a0a7d68176522740ace43b878235a60692203_o1";
const run = servidor.run

export async function loadTo3() {
    const CodeRepo = await run.load(codeRepoLocation);
    await CodeRepo.sync();

    window.Game = await run.load(CodeRepo.locations["Game"])
    window.Hero = await run.load(CodeRepo.locations["Hero"])
    window.InvitationRequest = await run.load(CodeRepo.locations["InvitationRequest"])
    return run.inventory.sync()
}


export async function joinGame(game) {
    await InvitationRequest.sync();
    await game.sync();
    const invitation = new InvitationRequest(run.owner.address, game);
    await invitation.sync();
    console.log("Invitation creada para", game.gameName);
    return invitation;
}

export async function waitForJoystickOnGame(game, f) {
    const j = await searchJoystickForGame(game);
    if (j) {
        f(j)
    } else {
        const i = setInterval(async () => {
            const j = await searchJoystickForGame(game);
            if (j) {
                f(j)
                clearInterval(i);
            }
        }, 5000)
    }

}

export const serializeCharacter = (pawn) => {
    return ({
        position: {
            x: pawn.position.x,
            y: pawn.position.y
        },
        direction: pawn.direction,
        health: pawn.health,
        location: pawn.location
    })
}

export const serializeGame = (game) => ({
    name: game.gameName,
    location: game.location,
    characters: game.pawns.map(serializeCharacter)
});

export async function searchJoystickForGame(game) {
    await game.sync();
    const misJoysticks = game.joysticks.filter(j => j.owner === run.owner.address);
    if (misJoysticks.length > 0) {
        return misJoysticks[0];
    } else {
        return null
    }
}

export async function decimeLosGames() {
    await Game.sync();
    await Promise.all(Game.all.map(g => g.sync()));
    return Game.all
}

export async function setupMonitorGame(game, reactToChange, reactToGameFinished) {
    setTimeout(async () => {
        let lastTurn = game.currentTurn
        console.log("chequeando cambios");
        await game.sync()
        if (lastTurn !== game.currentTurn) {
            console.log("game changed", game)
            await reactToChange(game)
        }
        if (game.winner !== null) {
            console.log("game finished", game)
            reactToGameFinished(game)
        } else {
            setupMonitorGame(game, reactToChange, reactToGameFinished)
        }
    }, 2500)
}

export async function getHeroes() {
    await run.inventory.sync()
    let heroes = run.inventory.jigs.filter(jig => jig instanceof Hero)
    return heroes
}
