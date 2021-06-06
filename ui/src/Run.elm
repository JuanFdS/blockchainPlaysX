port module Run exposing (..)


type alias Game =
    { name : String
    , location : String
    }



--port sendMessage : String -> Cmd msg


port updatedGames : (List Game -> msg) -> Sub msg
