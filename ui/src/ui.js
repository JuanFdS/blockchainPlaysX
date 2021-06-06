
export function getRun(address) {
    let run = new Run({ network: "test", owner: address });
    run.trust('*')
    return run
}

let servidor = {
    run: getRun("mj1WZ8wTimESFzLgio12iG55M5dYR16PwR")
}

const run = servidor.run
const JOYSTICK_ADDRESS = "d92a90ff0042431c94bcd92ecab2d6643832a176d3cf4b91e0c646f9bf08dc39_o1"
const TURN_ADDRESS = "ebf6211496ebf38b336e1d0a50f0c474608f892cf9658b5c7571a3cb53d5b439_o4"
const GAME_ADDRESS = "ebf6211496ebf38b336e1d0a50f0c474608f892cf9658b5c7571a3cb53d5b439_o2"
const INVITATION_REQUEST_ADDRESS = "ebf6211496ebf38b336e1d0a50f0c474608f892cf9658b5c7571a3cb53d5b439_o1"

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
