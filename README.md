[![Build Status](https://scrutinizer-ci.com/g/WHW-HD/frog-web/badges/build.png?b=master)](https://scrutinizer-ci.com/g/WHW-HD/frog-web/build-status/master)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/WHW-HD/frog-web/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/WHW-HD/frog-web/?branch=master)
[![Code Coverage](https://scrutinizer-ci.com/g/WHW-HD/frog-web/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/WHW-HD/frog-web/?branch=master)

# frog-web - Webserver und Datenbank für den WHW Wetterfrosch

~~~~
+-------------------+                       +-------------------------+
|                   |                       |                         |
|       frog        |                       |        frog-web         |
| WHW Wetterstation |                       |  Webserver + Datenbank  |
|                   |                       |                         |
+---------+---------+                       +------------+------------+
          |                                              ^
          |                                              |
          |                                              |
          |                                              |
          |                                              |
          |                                              |
          |                                              |
          |                                              |
          |                                              |
          |                                              |
          |                                              |
          |           +-------------------+              |
          |           |                   |              |
          |           |                   |              |
          +-----------> MQTT Broker       +---------------
                      |                   |
                      |                   |
                      +-------------------+
~~~~

__frog__ ist ein in golang geschriebenes Programm, welches auf der Wetterstation läuft. Die Wetterstation ist ein 
Raspberry PI Zero mit WLAN und hat Sensoren für:

 - Windgeschwindigkeit (Anemometer)
 - Windrichtung (Windvane) und
 - Regen
 
 Weitere Sensoren die wir gerne noch hinzufügen würden:
 
 - Temperatur Luft
 - Temperatur Wasser
 - Barometer
 - Webcam?
 
 Die Daten der Sensoren werden erfasst und dann über MQTT (MQTT ist ein de-facto Standard für IoT devices, 
 hier eine 5-Minuten Erklärung auf YouTube: https://www.youtube.com/watch?v=EIxdz-2rhLs) an einen Broker gesendet.
 
 In der Testphase verwenden wir noch den Public-Broker von test.mosquitto.org
 
 Die Sensordaten werden in die Channels 
 
~~~
const TOPIC_WINDVANE = "anemo/windvane"
const TOPIC_ANEMO    = "anemo/anemo"
const TOPIC_RAIN     = "anemo/rain"
~~~

gepublished.

Im __anemo/windvane__ Topic wird die Windrichtung einmal pro Sekunde geschrieben, in __anemo/anemo__ wird die 
Windgeschwindigkeit gepublished. Der Sensor erzeugt mehr Daten bei mehr Wind. In __anemo/rain__ wird pro 0.2494 mm 
Regen einmal gepublished.

Man kann das ganze (sofern der Sensor aktiv ist) einfach auf der Kommandozeile mit einem mqtt Client mithören:

~~~
sudo apt-get install mosquitto-clients
mosquitto_sub -v -h test.mosquitto.org -t 'anemo/windvane' -t 'anemo/anemo' -t 'anemo/rain'
~~~

__frog-web__ ist in nodejs geschrieben und hört auf den topics mit. Die Daten werden in einer SQLite Datenbank 
zwischengespeichert, um rudimentäre Auswertungen machen zu können.

Um Frog Web auf dem Lokalen Rechner zu installieren muss man nodejs installiert haben (ich empfehle mit nvm: 
https://github.com/creationix/nvm) und dann folgende Befehle ausführen:

~~~
git clone https://github.com/WHW-HD/frog-web.git
cd frog-web
npm install
npm run dev
~~~

Dieser Befehl startet einene Webserver auf Port 3000 auf dem man dann die Daten sehen kann: http://localhost:3000

Viel Spaß!
 
