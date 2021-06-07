# blockchainPlaysX

Public repository to be used for https://run.network/hackathon/.

The idea of the project will be a multiplayer game where any player can participate in it at any time by making a move, and they can see the effect they had in the game's world.

## Step by step playthrough

You can play the game here: https://pawn-wars.netlify.app/

When you enter, you'll be asked to login. Here, you'll need to enter the private key of an account that has funds.
You can use this one if you want: `cS24novn1wXprHBVTUN2eomKbqJmbQjis1xSs47gqnC5t4QLNFA6`.

<img width="1790" alt="imagen" src="https://user-images.githubusercontent.com/11432672/120982657-4fcb4f00-c74f-11eb-97e9-4af278eb02b3.png">

You can go to view your profile, where you will be able to see the heroes you have created (in this case their stats are hardcoded):

![index](https://user-images.githubusercontent.com/11432672/120985744-4b546580-c752-11eb-93db-ff32e2c47516.jpg)

After you login, the available games will be searched and you can join any of them by clicking `Join`. Also, you can click on the link and that will take you to the run.network explorer:

![index](https://user-images.githubusercontent.com/11432672/120983491-1f37e500-c750-11eb-87d1-e4ad402f7276.jpg)

When you click join, the page will wait until a game starts. When that happens, the page will be updated and you'll see the game:

<img width="1792" alt="imagen" src="https://user-images.githubusercontent.com/11432672/120986021-8a82b680-c752-11eb-9829-777837e6df54.png">

You can click on the arrows to send your characters into combat and when the game ticks, they will be placed on the field:

<img width="1789" alt="imagen" src="https://user-images.githubusercontent.com/11432672/120986252-c453bd00-c752-11eb-8335-96596cc0cc34.png">

Then, on each tick the characters will move towards each other to fight:

<img width="309" alt="imagen" src="https://user-images.githubusercontent.com/11432672/120986351-e0eff500-c752-11eb-9eb2-8c31b7b79e83.png">

New units can be added by any player even when the battle has already started so multiple players can play for each side,

<img width="301" alt="imagen" src="https://user-images.githubusercontent.com/11432672/120986408-f1a06b00-c752-11eb-8e24-7143f26b50b8.png">
<img width="302" alt="imagen" src="https://user-images.githubusercontent.com/11432672/120986479-0977ef00-c753-11eb-8c40-0dac5385c471.png">


https://user-images.githubusercontent.com/11432672/120987490-03364280-c754-11eb-8c37-60c9fd73625d.mov

In this case, both teams got to the other side at the same time, but the team going "UP" won because it got more units:

<img width="971" alt="imagen" src="https://user-images.githubusercontent.com/11432672/120987422-f4e82680-c753-11eb-9d54-03bbe526f139.png">


## The game

The idea of the game is inspired in https://clashroyale.fandom.com/wiki/Touchdown.

In our case, it's a slow paced competitive game by teams played in a field with several vertical tracks. Each team starts in either the top or the bottom of the field and the first team to get a pawn to the other side of the field wins.

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

#### Using the heroes to create the pawns

Right now, the heroes are not being used and all the pawns are the same kind of units, but it could be extended to have different heroes with different stats and when deploying a pawn have it be based on the hero you have.

#### Making it secure

At the moment everything was tried on the testnet, that's why we have an input where the private credentials are passed, there's still work left to do in order to make it usable for the mainnet.

##### Awarding prices

The idea we had to advance after the game finished was awarding prices to the players and allow them to apply those prices to their heroes, adding them experience or improving their stats. Some of the code for this was writen but it wasn't implemented in the version that's running now.


