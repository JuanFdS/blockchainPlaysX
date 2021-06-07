import './main.css';
import {Elm} from './Main.elm';
import * as serviceWorker from './serviceWorker';
import {decimeLosGames, getRun, loadTo3, getHeroes} from "./ui";

const elm = Elm.Main.init({
  node: document.getElementById('root')
});

async function startBlockchain() {
  await loadTo3();

  elm.ports.searchProfile.subscribe(async () => {
    let heroes = await getHeroes()
    elm.ports.profileFound.send( {
      location: run.owner.address || run.owner.owner,
      heroes: heroes.map(hero => ({ name: hero.name, location: hero.location }))
    });
  });

  elm.ports.getGames.subscribe(sendGames)

  elm.ports.setRunInstance.subscribe(async (location) => {
    localStorage.setItem('runConfig', JSON.stringify({ network: 'test', owner: location }))
    getRun()
    elm.ports.runInstanceWasSet.send(location)
  })

  elm.ports.autocompleteRunInstance.send(run.owner.owner || run.owner.address || "")

  sendGames()
}

async function sendGames() {
  const games = await decimeLosGames();

  const serializeCharacter = (pawn) => {
    return ({
      position: {
        x: pawn.position.x,
        y: pawn.position.y
      },
      health: pawn.health,
      location: pawn.location
    })
  }

  const gamesAMandar = games.map((game) => ({
    name: game.gameName,
    location: game.location,
    characters: game.pawns.map(serializeCharacter)
  }))

  elm.ports.updatedGames.send(gamesAMandar);
}

startBlockchain()


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
