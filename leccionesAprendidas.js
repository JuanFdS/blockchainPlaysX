// como cargar una clase

const Player = await run.load("a6f7b608d83a3d211f45dafa5c1ca156ce9a675c4de38402f78f64c739541612_o1")

const JoystickCode = await run.load("13588700143c126d9d10beccc99b586129d179a82245bd0cc1d14d2b1f2a5a78_o1")

const GameCode = await run.load("a6f7b608d83a3d211f45dafa5c1ca156ce9a675c4de38402f78f64c739541612_o1")

// como isntanciarla

new Player()

// como traerme un jig

juego = {}
//cliente
const invitacion = juego.unirme() //juego sigue siendo {}
//server
juego.empezar() // se buscan las invitaciones, lo resuelve ✨ la blockchain ✨

let {getRunInstanceServer} = await import("./main.js")
let {GameServer} = await import("./gameServer.js")
let run = getRunInstanceServer()

