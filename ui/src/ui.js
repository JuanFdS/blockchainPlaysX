
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
const GAME_ADDRESS = "f669a93455916e6d46a3bd8493ad5b282b6cbec1bc640e745dda7bd1cd3c138b_o1"
const INVITATION_REQUEST_ADDRESS = "bf191f23d53b95f2efe332fa62aff064a7ae72399d19ca46a546bb2b1ff3f29e_o1"
const HERO_ADDRESS = "b3dc18f5c1b8ed92482d360aaa100303cd0b126ba405cba461b4dd0af0b58497_o1"

export async function loadTo3() {
    window.Game = await run.load(GAME_ADDRESS)
    window.Hero = await run.load(HERO_ADDRESS)
    window.InvitationRequest = await run.load(INVITATION_REQUEST_ADDRESS)
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
