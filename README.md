# NON-GUI

## Server
cd Server
npm install 
node server.js

## Client
Einfach im Browser öffenen

ggf in server.js und index.html die Credentials anpassen

# Websocket
Nach den Aufbau muss die erste Nachricht der Auth-Token sein, der den User als Admin oder User identifiert. Bei Erfolgt erhält der User eine Message vom `type:"update"`

# Befehle
Befehle über Socket werden als JSON-Array mit 3 Elementen versendet. 
[ ID , ATTRIBUTE, VALUE]


## ID: System
 * add - Fügt ein neues WorldItem hinzu, Value: 0
 * del - Entfernt ein WorldItem, Value: WorldItem.id
 * export - Erstellt einen CFG Export, Value: 0
 * import - Import eine CFG, Value: Base64-String

## ID: World
 * tick - Aktueller Tick, Value: Integer
 * wind_source - Quelle des Windes, Value: 0-360
 * beauford_value - Wert auf der Beauford Skala, Value:  0-12

## ID: 0-999999999 des Objectes
 * name - Name des Objects, Value: String
 * description - Beschreibung des Objects, Value: String
 * image - Bild des Objects, Value: String
 * static - gibt an ob ein Object bewegt werden kann oder nicht, Value: Intger 0/1
 * xy - Setzt die X und Y Koordinate, Value: [Integer, Integer]
 * x - Setzt die X Achse, Value: Integer
 * y - Setzt die Y Achse, Value: Integer
 * orientation - Ausrichtung des Objectes, Value: Integer 0-360
 * player_controlled - Ob das Objekt vom Spieler Kontrolliert werden darf, Value: Integer 0/1
 * sail_area - Segelfläche, Value: Double 0.0 - 1.0
 * weight_penalty - Gewichtsabzüge: Value: Double 0.0 - 1.0


# TODO
 * WeaponGroup Erzeugen/Entfernen
 * Rundensystem
 * * Wenn eine Runde gestartet wird werden alle Änderungen vorgehalten
 * * Wenn eine Runde dann commited wird werden die Änderungen vollzogen und ggf Treffer bei beschuss Angezeigt.
 * * Es sollte vermutlich ein Log geführt werden was für änderungen getätigt wurden
 * Mehr Sicherheit 