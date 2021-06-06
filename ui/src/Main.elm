module Main exposing (..)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick, onInput)
import Run exposing (..)



---- MODEL ----


type Model
    = EsperandoGames
    | GamesConseguidos (List Game)
    | Jugando RunningGame
    | WaitingProfile
    | Profile Profile
    | ProfileSearchPage Location


init : ( Model, Cmd Msg )
init =
    ( EsperandoGames, getGames () )



---- UPDATE ----


type Msg
    = NoOp
    | GamesUpdated (List Game)
    | SeleccionarCelda Celda
    | Join Game
    | SearchProfile
    | ProfileGot Profile
    | UpdatedProfileToSearch Location
    | GoTo Model
    | AskForGames


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( model, msg ) of
        ( ProfileSearchPage location, UpdatedProfileToSearch newLocation ) ->
            ( ProfileSearchPage newLocation, Cmd.none )

        ( ProfileSearchPage location, SearchProfile ) ->
            ( WaitingProfile, searchProfile location )

        ( WaitingProfile, ProfileGot profile ) ->
            ( Profile profile, Cmd.none )

        ( _, NoOp ) ->
            ( model, Cmd.none )

        ( EsperandoGames, GamesUpdated games ) ->
            ( GamesConseguidos games, Cmd.none )

        ( Jugando runningGame, SeleccionarCelda celda ) ->
            ( Jugando { runningGame | selectedCharacter = characterIn celda }, Cmd.none )

        ( GamesConseguidos _, Join game ) ->
            ( Jugando { game = game, selectedCharacter = Nothing }, Cmd.none )

        ( _, AskForGames ) ->
            ( EsperandoGames, getGames () )

        ( _, GoTo newModel ) ->
            ( newModel, Cmd.none )

        _ ->
            ( model, Cmd.none )


viewWithHeaders : Html Msg -> Html Msg
viewWithHeaders page =
    div
        []
        [ div [ style "display" "flex" ]
            [ tab "Search Profile" <| GoTo <| ProfileSearchPage ""
            , tab "Search Games" <| AskForGames
            ]
        , page
        ]


tab name msg =
    div
        [ style "width" "100%"
        , class "tab"
        , onClick msg
        ]
        [ text name ]


view : Model -> Html Msg
view model =
    viewWithHeaders <|
        case model of
            EsperandoGames ->
                div []
                    [ text "loading" ]

            GamesConseguidos games ->
                div []
                    [ h1 [] [ text "Games" ]
                    , button [ onClick <| GoTo <| ProfileSearchPage "" ] [ text "Search profile" ]
                    , ul [] <|
                        List.map viewGame games
                    ]

            Jugando game ->
                viewRunningGame game

            Profile profile ->
                div [ style "margin-top" "1em" ]
                    [ aHrefToBlockChain profile [ text profile.location ]
                    ]

            WaitingProfile ->
                div [] [ text "loading" ]

            ProfileSearchPage location ->
                div [ style "margin-top" "1em" ]
                    [ label [] [ text "See profile for address: " ]
                    , input [ onInput UpdatedProfileToSearch ] [ text location ]
                    , button [ onClick SearchProfile ] [ text "Search" ]
                    ]


viewGame game =
    li []
        [ button [ onClick (Join game) ] [ text "Join" ]
        , aHrefToBlockChain game [ text game.name ]
        ]


viewRunningGame : RunningGame -> Html Msg
viewRunningGame runningGame =
    li []
        [ a [ href <| linkToBlockchain runningGame.game.location ]
            [ text runningGame.game.name
            ]
        , button [] [ text "//TODO: Unirse" ]
        , div [ style "display" "flex", style "flex-direction" "column", style "align-items" "center" ]
            [ tablero runningGame.game.characters
            , case runningGame.selectedCharacter of
                Nothing ->
                    text ""

                Just character ->
                    viewCharacter character
            ]
        ]


viewCharacter : Character -> Html Msg
viewCharacter character =
    div [ style "display" "flex", style "flex-direction" "column" ]
        [ div [] [ text <| "Health: " ++ String.fromInt character.health ]
        , aHrefToBlockChain character [ text "Open in blockchain explorer" ]
        ]



-- Por ahora solo sirve para cosas de 8x20, no solo por los rangos si no por el auto auto auto auto auto etc


tablero : List Character -> Html Msg
tablero characters =
    div [ style "display" "grid", style "grid-template-columns" "auto auto auto auto auto auto auto auto", style "width" "200px" ]
        (List.range 1 20 |> List.indexedMap (\x _ -> List.range 1 8 |> List.indexedMap (\y _ -> celdaSegunSiHayPersonaje characters ( x, y ))) |> List.concat)



-- Despues habria que poner diferentes cosas segun que personaje es, ahora son todos ROJOS


find condition list =
    List.head <| List.filter condition list


celdaSegunSiHayPersonaje : List Character -> ( Int, Int ) -> Html Msg
celdaSegunSiHayPersonaje posicionesPersonajes ( y, x ) =
    case find (\p -> p.position.x == x && p.position.y == y) posicionesPersonajes of
        Just character ->
            viewCelda ( x, y ) <| Ocupada character

        Nothing ->
            viewCelda ( x, y ) Libre


type Celda
    = Libre
    | Ocupada Character


characterIn celda =
    case celda of
        Libre ->
            Nothing

        Ocupada c ->
            Just c


ocupada celda =
    celda /= Libre


viewCelda : ( Int, Int ) -> Celda -> Html Msg
viewCelda ( x, y ) celda =
    div
        [ style "background"
            (if ocupada celda then
                "red"

             else
                "aliceblue"
            )
        , style "border-width" "thin"
        , style "border-style" "groove"
        , style "border-color" "deepskyblue"
        , style "height" "1.5em"
        , style "width" "2em"
        , onClick (SeleccionarCelda celda)
        ]
        [ text <|
            (if celda == Libre then
                ""

             else
                "🤺"
            )
                ++ String.fromInt x
                ++ "-"
                ++ String.fromInt y
        ]


aHrefToBlockChain : { x | location : String } -> List (Html Msg) -> Html Msg
aHrefToBlockChain jig children =
    a [ target "_blank", href <| linkToBlockchain jig.location ]
        children


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
        , subscriptions =
            \model ->
                case model of
                    EsperandoGames ->
                        updatedGames GamesUpdated

                    WaitingProfile ->
                        profileFound ProfileGot

                    _ ->
                        Sub.none
        }
