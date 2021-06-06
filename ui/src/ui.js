
export function getRun(address) {
    let run = new Run({ network: "test", owner: address });
    run.trust('*')
    return run
}

let servidor = {
    run: getRun("mj1WZ8wTimESFzLgio12iG55M5dYR16PwR")
}

const run = servidor.run
const JOYSTICK_ADDRESS = "31aa49bf375959d9385b631a4935bc9044dece869e6d2e070fa75bee9ddade6d_o3"
const TURN_ADDRESS = "31aa49bf375959d9385b631a4935bc9044dece869e6d2e070fa75bee9ddade6d_o4"
const GAME_ADDRESS = "31aa49bf375959d9385b631a4935bc9044dece869e6d2e070fa75bee9ddade6d_o2"
const INVITATION_REQUEST_ADDRESS = "31aa49bf375959d9385b631a4935bc9044dece869e6d2e070fa75bee9ddade6d_o1"

export async function loadTo3() {
    window.Joystick = await run.load(JOYSTICK_ADDRESS)
    window.Turn = await run.load(TURN_ADDRESS)
    window.Game = await run.load(GAME_ADDRESS)
    window.InvitationRequest = await run.load(INVITATION_REQUEST_ADDRESS)
    return run.inventory.sync()
}

export function decimeLosGames() {
    return run.inventory.jigs.filter(j => j instanceof Game)
}
