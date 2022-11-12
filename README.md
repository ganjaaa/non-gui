# NON-GUI

## Server
cd Server
npm run serve

## Client
Einfach im Browser öffenen

ggf in server.js und index.html die Credentials anpassen

# Websocket
Nach den Aufbau muss die erste Nachricht der Auth-Token sein, der den User als Admin oder User identifiert. Bei Erfolgt erhält der User World-Update Messages

## Befehle
Befehle über Socket werden als JSON-Array mit 3 Elementen versendet. 
`[ SYSTEM , COMMAND, VALUE]`

| System | Command | Value | Beschreibung
| ----- | ----- | ----- | -----
| system | broadcast | - | 
| system | export | - | 
| system | import | Base64-String | 
|  |  |  | 
| dice | roll | Dice Notation z.B. `3d6+2` oder `1d6+2d20+2` | Würfelt einen Würfel
| dice | max | Dice Notation z.B. `3d6+2` oder `1d6+2d20+2` | Zeigt den max möglichen Wert eines Würfels
| dice | min | Dice Notation z.B. `3d6+2` oder `1d6+2d20+2` | Zeigt den min möglichen Wert eines Würfels
|  |  |  | 
| world | edit_mode | Integer: 0/1 | 
| world | tick | Integer | 
| world | wind_source | Value: 0-360 | 
| world | beauford_value | Value:  0-12 | 
| world | add_item | - | 
| world | del_item | WorldItem.id | 
|  |  |  | 
| [ID] | name | String |  Name des Objects
| [ID] | description | String | Beschreibung des Objects
| [ID] | image | String |  Bild des Objects
| [ID] | static | Value: Integer 0/1 | gibt an ob ein Object bewegt werden kann oder nicht
| [ID] | xy |  Array [Integer, Integer] |  Setzt die X und Y Achse
| [ID] | x | Integer |  Setzt die X Achse
| [ID] | y | Integer |  Setzt die Y Achse
| [ID] | orientation |  Integer 0-360 | Ausrichtung des Objectes
| [ID] | player_controlled |   Integer 0/1 | Ob das Objekt vom Spieler Kontrolliert werden darf
| [ID] | sail_area | Double 0.0 - 1.0 | setzt Segelfläche
| [ID] | weight_penalty | Double 0.0 - 1.0 | setzt Gewichtsabzüge

## Responses
Anworten des Server erfolgen im selben Schema wie die Befehle
`[ SYSTEM , COMMAND , VALUE]`
| System | Command | Value | Beschreibung
| ----- | ----- | ----- | -----
| system | export | String | Ein Base64 String des Exports
| ----- | ----- | ----- | -----
| dice | roll | Integer | Ergebnis des Wurfs
| dice | max | Integer | Das Max mögliche Ergebnis des Würfels
| dice | min | Integer | Das Min mögliche Ergebnis des Würfels
| ----- | ----- | ----- | -----
| world | update | Object | Ein Objekt der kompletten Welt zum Rendern der GUI




# TODO
 * WeaponGroup Erzeugen/Entfernen
 * Aktuell sind alle Änderungen live. Es müsste ein Game-Mode getriggert werden, welcher Änderungen erst beim Erhöhen des Ticks übernimmt
 * Rundensystem
 * * Wenn eine Runde gestartet wird werden alle Änderungen vorgehalten
 * * Wenn eine Runde dann commited wird werden die Änderungen vollzogen und ggf Treffer bei beschuss Angezeigt.
 * * Es sollte vermutlich ein Log geführt werden was für änderungen getätigt wurden
 * * Koordinaten müssten kompliziert berechnet werden
 * Mehr Sicherheit 

 # Notes:
 WYSIWYG Editor: https://jbt.github.io/markdown-editor/