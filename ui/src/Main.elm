module Main exposing (..)

import Browser
import Html exposing (..)
import Html.Attributes exposing (href, src)
import Run exposing (Game, updatedGames)



---- MODEL ----


type Model
    = EsperandoGames
    | GamesConseguidos (List Game)


init : ( Model, Cmd Msg )
init =
    ( EsperandoGames, Cmd.none )



---- UPDATE ----


type Msg
    = NoOp
    | GamesUpdated (List Game)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        GamesUpdated games ->
            ( GamesConseguidos games, Cmd.none )



---- VIEW ----


view : Model -> Html Msg
view model =
    case model of
        EsperandoGames ->
            div []
                [ text "cargando" ]

        GamesConseguidos games ->
            div []
                [ img [ src "/logo.svg" ] []
                , h1 [] [ text "Games" ]
                , ul [] <|
                    List.map
                        (\game ->
                            li []
                                [ a [ href <| linkToBlockchain game.location ]
                                    [ text game.name
                                    ]
                                , button [] [ text "Unirse (?" ]
                                ]
                        )
                        games
                ]


linkToBlockchain : String -> String
linkToBlockchain location =
    "https://run.network/explorer/?query=" ++ location ++ "&network=test"



---- PROGRAM ----


main : Program () Model Msg
main =
    Browser.element
        { view = view
        , init = \_ -> init
        , update = update
        , subscriptions = \model -> updatedGames GamesUpdated
        }
