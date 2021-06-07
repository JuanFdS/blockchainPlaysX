# blockchainPlaysX

Public repository to be used for https://run.network/hackathon/.

The idea of the project will be a multiplayer game where any player can participate in it at any time by making a move, and they can see the effect they had in the game's world.

## The game

The idea of the game is inspired in https://clashroyale.fandom.com/wiki/Touchdown.

In our case, it's a competitive game by teams played in a field with several vertical tracks. Each team starts in either the top or the bottom of the field and the first team to get a pawn to the other side of the field wins.

A player can place a pawn in any track of their side. The game refreshes every some seconds, when this happens all pawns either move one step forward or battle with near pawns.

Also, the pawns players place in the game are instances of Heroes they own and that can be traded. These heroes determine the stats (health, offensive power) of the pawns, and can be leveled up by feeding them prizes. Finally, the prizes are awarded to the players of the winning team.

## How to play

You'll need to setup the game server, which owns both the classes and some jigs that handle the game, including a jig that represents the game itself.

As a player, you need to login using your private key and when you do that you can either see your heroes or request an invite to a battle.
When the server starts, you will see a grid and you will be able to click in a track to add your pawn there.

As the server's owner, you can start a game, accepting the requests from players, which will grant them a "Joystick".
Then, you can run a game's tick so every character moves forward and battles foes.

When one character gets to the other side, that team wins and the game ends.

## Unfinished / To do

