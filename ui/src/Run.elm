port module Run exposing (..)


type alias Position =
    { x : Int, y : Int }


type alias Character =
    { position : Position
    , health : Int
    , location : Location
    }


type alias Profile =
    { location : Location
    , heroes : List Hero
    }


type alias Hero =
    { name : String
    , location : Location
    }


type alias Game =
    { name : String
    , location : Location
    , characters : List Character
    }


type alias RunningGame =
    { game : Game
    , joystickLocation : Location
    , selectedCharacter : Maybe Character
    }


type alias Location =
    String


port joinGame : Location -> Cmd msg


port gameStarted : ({ joystick : Location, game : Game } -> msg) -> Sub msg


port searchProfile : () -> Cmd msg


port getGames : () -> Cmd msg


port profileFound : (Profile -> msg) -> Sub msg


port updatedGames : (List Game -> msg) -> Sub msg


port runInstanceWasSet : (Location -> msg) -> Sub msg


port setRunInstance : Location -> Cmd msg


port autocompleteRunInstance : (Location -> msg) -> Sub msg
