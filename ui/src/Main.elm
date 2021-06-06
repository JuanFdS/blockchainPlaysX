module Main exposing (..)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Run exposing (Game, updatedGames, Position)



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
                                , button [] [ text "//TODO: Unirse" ]
                                , div [style "display" "flex", style "flex-direction" "column", style "align-items" "center"] [
                                    tablero game.characters
                                    ]
                                ]
                        )
                        games
                ]

-- Por ahora solo sirve para cosas de 8x20, no solo por los rangos si no por el auto auto auto auto auto etc
-- also, rotisimo el tema de las coordenadas como van a ver, arreglarlo se deja como ejercicio el lector (?
tablero : List Position -> Html Msg
tablero characters = div [style "display" "grid", style "grid-template-columns" "auto auto auto auto auto auto auto auto", style "width" "200px"]
                         (List.range 1 8 |> List.indexedMap (\x _ -> (List.range 1 20 |> List.indexedMap (\y _ -> celdaSegunSiHayPersonaje characters (x, y)))) |> List.concat)

-- Despues habria que poner diferentes cosas segun que personaje es, ahora son todos ROJOS
celdaSegunSiHayPersonaje : List Position -> (Int, Int) -> Html Msg
celdaSegunSiHayPersonaje posicionesPersonajes (x, y) = case List.any (\p -> p.x == x && p.y == y) posicionesPersonajes of
    True -> viewCelda OcupadaRojo
    False -> viewCelda Libre


type Celda = Libre | OcupadaRojo | OcupadaAzul

viewCelda : Celda -> Html Msg
viewCelda celda = div [style "background" (if celda == OcupadaRojo then "red" else "aliceblue"),
                       style "border-width" "thin",
                       style "border-style" "groove",
                       style "border-color" "deepskyblue",
                       style "height" "1.5em",
                       style "width" "2em"]
                      [text <| if celda == Libre then "" else "🤺"]

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
