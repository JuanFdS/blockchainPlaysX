port module Run exposing (..)


type alias Position =
    { x : Int, y : Int }


type alias Character =
    { position : Position
    , health : Int
    , location : String
    }


type alias Game =
    { name : String
    , location : String
    , characters : List Character
    }


type alias RunningGame =
    { game : Game
    , selectedCharacter : Maybe Character
    }



--port sendMessage : String -> Cmd msg


port updatedGames : (List Game -> msg) -> Sub msg
