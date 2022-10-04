# NON-GUI

## Server
cd Server
npm install 
node server.js

## Client
Einfach im Browser öffenen

ggf in server.js und index.html die Credentials anpassen



# Commands

## Basic
Command werden in einen Array von 3 verschickt
[ ID , COMMAND, VALUE]


## World
ID = "world"

### Change Wind Source 
COMMAND = "wind_source"
VALUE = Integer between 0 and 360

["world","wind_source", 90]

### Change Beauford value 
COMMAND = "beauford_value"
VALUE = Integer between 0 and 12

["world","beauford_value", 4]

## WorldItem

["0","orientation", 90]