
export function getRun() {
    if(localStorage.getItem('runConfig')) {
        let run = null
        try {
            run = new Run(JSON.parse(localStorage.getItem('runConfig')));
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

const run = servidor.run
const codeRepoLocation = "5820414bfb5c139c7583716c907fcb3f400b382e7f65b1caeeeb2102bad3ef81_o1";

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
    const invitation = new InvitationRequest(run.owner.address,game);
    await invitation.sync();
    return invitation;
}

export async function decimeLosGames() {
    await Game.sync();
    await Promise.all(Game.all.map(g => g.sync()));
    return Game.all
}

export async function getHeroes() {
    await run.inventory.sync()
    let heroes = run.inventory.jigs.filter(jig => jig instanceof Hero)
    return heroes
}
