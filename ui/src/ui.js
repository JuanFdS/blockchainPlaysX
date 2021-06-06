
export function getRun() {
    let run = new Run(JSON.parse(localStorage.getItem('runConfig')));
    run.trust('*')
    return run
}

let servidor = {
    run: getRun()
}

const run = servidor.run
const JOYSTICK_ADDRESS = "31aa49bf375959d9385b631a4935bc9044dece869e6d2e070fa75bee9ddade6d_o3"
const TURN_ADDRESS = "31aa49bf375959d9385b631a4935bc9044dece869e6d2e070fa75bee9ddade6d_o4"
const GAME_ADDRESS = "df19d0b395f705d752de7b8ca75103fdc6e7680e15b70356803996c4ba2a9401_o1"
const INVITATION_REQUEST_ADDRESS = "31aa49bf375959d9385b631a4935bc9044dece869e6d2e070fa75bee9ddade6d_o1"

export async function loadTo3() {
    window.Joystick = await run.load(JOYSTICK_ADDRESS)
    window.Turn = await run.load(TURN_ADDRESS)
    window.Game = await run.load(GAME_ADDRESS)
    window.InvitationRequest = await run.load(INVITATION_REQUEST_ADDRESS)
    return run.inventory.sync()
}

export async function decimeLosGames() {
    await Game.sync();
    await Promise.all(Game.all.map(g => g.sync()));
    return Game.all
}
