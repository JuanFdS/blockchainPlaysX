import './main.css';
import {Elm} from './Main.elm';
import * as serviceWorker from './serviceWorker';
import {
  decimeLosGames,
  getRun,
  joinGame,
  getHeroes,
  loadTo3,
  serializeGame,
  waitForJoystickOnGame,
  searchJoystickForGame, setupMonitorGame
} from "./ui";

const elm = Elm.Main.init({
  node: document.getElementById('root')
});

async function startBlockchain() {
  await loadTo3();

  elm.ports.searchProfile.subscribe(async () => {
    let heroes = await getHeroes()
    let profile = {
      location: run.owner.address || run.owner.owner,
      heroes: heroes.map(hero => ({ name: hero.name, location: hero.location }))
    }
    console.log("Profile", profile)
    elm.ports.profileFound.send(profile);
  });

  elm.ports.monitorGame.subscribe(async (gameLocation) => {
      console.log('monitorear:', gameLocation);
      const game = await run.load(gameLocation);
      await setupMonitorGame(game,
        async (g) => {
          console.log("cambio", g)
          elm.ports.gameUpdated.send({game: serializeGame(g)})
        },
        (g) => console.log("termino", g));
  });

  elm.ports.deployHero.subscribe(async ({joystick: joystickLocation, column}) => {
      const joystick = await run.load(joystickLocation);
      await joystick.sync();
      console.log('deployanding')
      joystick.deployHero('cosa', column);
      await joystick.sync();
  })

  elm.ports.getGames.subscribe(sendGames)

  elm.ports.setRunInstance.subscribe(async (location) => {
    localStorage.setItem('runConfig', JSON.stringify({
      network: 'test',
      owner: location,
      purse: location,
    }))
    getRun()
    elm.ports.runInstanceWasSet.send(location)
  })

  elm.ports.autocompleteRunInstance.send(run.owner.privkey || run.owner.owner || run.owner.address || "")

  elm.ports.joinGame.subscribe(async (gameLocation) => {
    const game = await run.load(gameLocation);
    const joystick = await searchJoystickForGame(game);
    if (joystick) {
      let payload = {joystick: joystick.location, game: serializeGame(game)};
      elm.ports.gameStarted.send(payload);
      return;
    }

    await joinGame(game);
    waitForJoystickOnGame(game, (joystick) => {
      let payload = {joystick: joystick.location, game: serializeGame(game)};
      console.log(payload);
      elm.ports.gameStarted.send(payload);
    })
  })

  sendGames()
}

async function sendGames() {
  const games = await decimeLosGames();

  const gamesAMandar = games.map(serializeGame)

  console.log(games);
  console.log(gamesAMandar);

  elm.ports.updatedGames.send(gamesAMandar);
}


startBlockchain()


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
