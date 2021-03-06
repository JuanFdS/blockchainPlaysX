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
    | Login Location


type alias RunningGame =
    { game : Game
    , joystickLocation : Location
    , selectedCelda : Maybe Celda
    }


init : ( Model, Cmd Msg )
init =
    ( Login "", Cmd.none )



---- UPDATE ----


type Msg
    = NoOp
    | GamesUpdated (List Game)
    | SeleccionarCelda Celda
    | RequestToJoin Game
    | SearchProfile
    | ProfileGot Profile
    | GoTo Model
    | AskForGames
    | ChangeLoginAddress Location
    | LoggedIn
    | RunInstanceSet
    | JoinedGame Location Game
    | GameUpdated Game
    | DeployHero Int


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( model, msg ) of
        ( _, ChangeLoginAddress newLocation ) ->
            ( Login newLocation, Cmd.none )

        ( _, RunInstanceSet ) ->
            ( EsperandoGames, getGames () )

        ( _, SearchProfile ) ->
            ( WaitingProfile, searchProfile () )

        ( Login location, LoggedIn ) ->
            ( EsperandoGames, setRunInstance location )

        ( WaitingProfile, ProfileGot profile ) ->
            ( Profile profile, Cmd.none )

        ( _, JoinedGame joystickLocation game ) ->
            ( Jugando
                { selectedCelda = Nothing
                , joystickLocation = joystickLocation
                , game = game
                }
            , monitorGame game.location
            )

        ( _, NoOp ) ->
            ( model, Cmd.none )

        ( Jugando runningGame, DeployHero column ) ->
            ( model, deployHero { joystick = runningGame.joystickLocation, column = column } )

        ( Jugando runningGame, GameUpdated game ) ->
            ( Jugando
                { runningGame
                    | game = game
                }
            , Cmd.none
            )

        ( EsperandoGames, GamesUpdated games ) ->
            ( GamesConseguidos games, Cmd.none )

        ( Jugando runningGame, SeleccionarCelda celda ) ->
            ( Jugando { runningGame | selectedCelda = Just celda }, Cmd.none )

        ( GamesConseguidos _, RequestToJoin game ) ->
            ( model, joinGame game.location )

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
            [ tab "View Profile" <| SearchProfile
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


viewLogin address =
    div [ style "margin-top" "3em" ]
        [ label [] [ text "Enter your address" ]
        , input [ onInput ChangeLoginAddress, value address ] []
        , button [ onClick LoggedIn ] [ text "Login" ]
        ]


view : Model -> Html Msg
view model =
    case model of
        Login address ->
            viewLogin address

        otherModel ->
            viewWithHeaders <|
                case otherModel of
                    EsperandoGames ->
                        div []
                            [ text "loading" ]

                    GamesConseguidos games ->
                        div []
                            [ h1 [] [ text "Games" ]
                            , ul [] <|
                                List.map viewGame games
                            ]

                    Jugando game ->
                        viewRunningGame game

                    Profile profile ->
                        div [ style "margin-top" "1em" ]
                            [ aHrefToBlockChain profile [ text profile.location ]
                            , viewHeroes profile.heroes
                            ]

                    WaitingProfile ->
                        div [] [ text "loading" ]

                    Login address ->
                        viewLogin address


heroCard : Hero -> Html Msg
heroCard hero =
    div [ class "card" ]
        [ div [ class "card-image" ]
            []
        , div [ class "card-text" ]
            [ h2 []
                [ text hero.name ]
            , p []
                [ aHrefToBlockChain hero [ text "Open in blockchain explorer" ] ]
            ]
        , div [ class "card-stats" ]
            [ div [ class "stat" ]
                [ div [ class "value" ]
                    [ text "4"
                    ]
                , div [ class "type" ]
                    [ text "Strength" ]
                ]
            , div [ class "stat border" ]
                [ div [ class "value" ]
                    [ text "5123" ]
                , div [ class "type" ]
                    [ text "Speed" ]
                ]
            , div [ class "stat" ]
                [ div [ class "value" ]
                    [ text "32" ]
                , div [ class "type" ]
                    [ text "Intellect" ]
                ]
            ]
        ]


viewHeroes : List Hero -> Html Msg
viewHeroes heroes =
    div [ style "display" "flex" ] (List.map heroCard heroes)


viewGame game =
    li []
        [ button [ onClick (RequestToJoin game) ] [ text "Join" ]
        , aHrefToBlockChain game [ text game.name ]
        ]


viewRunningGame : RunningGame -> Html Msg
viewRunningGame runningGame =
    li []
        [ aHrefToBlockChain runningGame.game [ text runningGame.game.name ]
        , div [ style "display" "flex", style "flex-direction" "column", style "align-items" "center" ]
            [ tablero runningGame.game.characters
            , case runningGame.selectedCelda of
                Nothing ->
                    text ""

                Just celda ->
                    case celda.contenido of
                        Libre ->
                            text ""

                        Ocupada character ->
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
    div [ style "display" "grid", style "grid-template-columns" "auto auto auto auto auto auto auto auto", style "width" "200px" ] <|
        (List.range 0 20
            |> List.map
                (\x ->
                    List.range 0 7
                        |> List.map
                            (\y ->
                                celdaSegunSiHayPersonaje characters ( x, y )
                            )
                )
            |> List.concat
        )
            ++ (List.range 0 7 |> List.map (\y -> button [ onClick <| DeployHero y ] [ text "^" ]))



-- Despues habria que poner diferentes cosas segun que personaje es, ahora son todos ROJOS


find condition list =
    List.head <| List.filter condition list


celdaSegunSiHayPersonaje : List Character -> ( Int, Int ) -> Html Msg
celdaSegunSiHayPersonaje posicionesPersonajes ( y, x ) =
    case find (\p -> p.position.x == x && p.position.y == y) posicionesPersonajes of
        Just character ->
            viewCelda ( x, y ) <| { position = character.position, contenido = Ocupada character }

        Nothing ->
            viewCelda ( x, y ) <| { position = { x = x, y = y }, contenido = Libre }


type alias Celda =
    { position : Position
    , contenido : ContenidoCelda
    }


type ContenidoCelda
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
            (case celda.contenido of
                Libre ->
                    if modBy 2 x == 0 then
                        "aliceblue"

                    else
                        "lightgreen"

                Ocupada caracter ->
                    if caracter.direction == "UP" then
                        "red"

                    else
                        "blue"
            )
        , style "border-width" "thin"
        , style "border-style" "groove"
        , style "border-color" "deepskyblue"
        , style "height" "1.5em"
        , style "width" "2em"
        , onClick (SeleccionarCelda celda)
        ]
        [ text <|
            (if celda.contenido == Libre then
                ""

             else
                "????"
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
                Sub.batch
                    [ updatedGames GamesUpdated
                    , profileFound ProfileGot
                    , runInstanceWasSet (\_ -> RunInstanceSet)
                    , autocompleteRunInstance ChangeLoginAddress
                    , gameStarted (\coso -> JoinedGame coso.joystick coso.game)
                    , gameUpdated (\coso -> GameUpdated coso.game)
                    ]
        }
