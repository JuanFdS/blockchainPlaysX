port module Run exposing (..)

type alias Position = { x : Int, y : Int }

type alias Game =
    { name : String
    , location : String
    , characters: List Position
    }



--port sendMessage : String -> Cmd msg


port updatedGames : (List Game -> msg) -> Sub msg
