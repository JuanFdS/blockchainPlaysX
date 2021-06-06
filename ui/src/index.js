import './main.css';
import {Elm} from './Main.elm';
import * as serviceWorker from './serviceWorker';
import {decimeLosGames, loadTo3} from "./ui";

const elm = Elm.Main.init({
  node: document.getElementById('root')
});

async function startBlockchain() {
  await loadTo3();

  const games = decimeLosGames();

  const serializeCharacter = (character) => {
    return ({
      position: {
        x: character.position.x,
        y: character.position.y
      },
      health: character.health,
      location: character.location
    })
  }

  const gamesAMandar = games.map((game) => ({
    name: game.gameName,
    location: game.location,
    characters: game.characters.map(serializeCharacter)
  }))

  console.log(games);
  console.log(gamesAMandar);

  elm.ports.updatedGames.send(gamesAMandar);
}

startBlockchain()


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
