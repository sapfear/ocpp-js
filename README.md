# ocpp-js
Open Charge Point Protocol Implementation in JS

## Installation
```
npm install --save ocpp-js
```

## Overview

Open Charge Point Protocol (OCPP, <http://ocppforum.net>) is a communication
protocol between multiple charging stations ("charge points") and a single
management software ("central system").

Currently two OCPP versions (1.2 and 1.5) have been released.
There is a draft in progress for a new version (2.0).
Both existing versions use SOAP over HTTP as the RPC/transport protocol:

    +---------------+ soap/http client      soap/http server +----------------+
    |               |--------------------------------------->|                |
    |               |  Operations initiated by ChargePoint   |                |
    |  Charge Point |                                        | Central System |
    |               | soap/http server      soap/http client |                |
    |               |<---------------------------------------|                |
    +---------------+  Operations initiated by CentralSystem +----------------+


## Usage
OCPP JS uses a MongoDB DB to store all the actions received from charge points example: BootNotification, MeterValues, StartTransaction ...
Currently, the project supports MongoDB, firebase and file storage.
In order to specify which DB to use, create a folder config, and then create a file default.json and insert your preferred storage method:

```
{
    "defaultDB": "mongodb",
    "mongodb": {
        "url": "mongodb://localhost/mydb"
    },
    "firebase": {
      "apiKey": "[apiKey]",
      "authDomain": "[authDomain]",
      "databaseURL": "[databaseURL]",
      "storageBucket": "[storageBucket]",
      "messagingSenderId": "[messagingSenderId]"
  }
}
```
You can use Firebase by setting defaultDB : firebase.

To be able to create a Central System, some charging points and a charging point server, you can use this code snippet:

```
var OCPP =  require('ocpp-js');

var options = {
  centralSystem: {
    port: 9220
  },
  chargingPoint: {
    serverURI: 'http://localhost:9221/Ocpp/ChargePointService',
    name: 'Simulator 1'
  },
  chargingPointServer: {
    port: 9221
  }
}

var ocppJS = new OCPP(options);

// Create Central System
var centralSystem = ocppJS.createCentralSystem();

// Create Charging Point Client
var chargingPoint1 = ocppJS.createChargingPoint('http://127.0.0.1:8081/ChargeBox/Ocpp', "chargingPoint1-Simulator");
var chargingPoint2 = ocppJS.createChargingPoint('http://localhost:9221/Ocpp/ChargePointService', "chargingPoint2-Simulator");

// Charging Point Params can be also taken from options
var chargingPoint1 = ocppJS.createChargingPoint();

// Create Charging Point Server
var chargingPointServer = ocppJS.createChargingPointServer(9221);

```

## ChargeBox.js

Производит обмен между базой данных MongoDB и центральной системой.
Файл charge_box.js является входной точкой работы модуля.
Значимые технические моменты:
	1) Предварительно запускается подключение к БД в функции mongoConnect
	2) При соединения с БД запускается boot_notificate_loop, в которой проверяется включение ПЛК. 
	Этапы включение - получить ответ от ПЛК, self.boot_state переводится в значение 1
	Отправляется запрос BootNotification в ocpp, self.boot_state переводится в значение 2
	Получается положительный ответ на BootNotification, self.boot_state переводится в значение 3, запускается основной цикл работы main_loop
	При неудачном запросе BootNotification, self.boot_state переводится в значение 4, происходит выход из программы.
	
	3) В основном цикле main_loop происходит поиск данных в состоянии ReceivedFromModbus:
		3.1) tag_requests - запросы на авторизацию
		3.2) status_notifications - запросы на отправку данных в запросе StatusNotification
		3.3) start_transaction - запрос начала зарядки
		3.4) stop_transactions - запросы остановки зарядки
	
	4) Каждый отправленный запрос ставится в очередь и после обрабатывается в файле /entities/ChargingPoint.js
	ChargingPoint.js читает запросы из очереди функцией processActionsQueue и последовательно их отправляет.
	Асинхронные ответы обрабатываются соответствующими методами в этом файле:
		bootNotification -> bootNotificationResult
		heartbeat -> heartbeatResult
		startTransaction -> startTransactionResult
		...
	
	5) Также в файле charge_box.js происходит запуск циклов передачи метрик зарядки.
	За это отвечает функция meter_aligned_loop.
	Она запускается каждые 10 секунд и каждый раз выравнивает свой следующий запуск по этой временной границе.
	
	6) Прием запросов из центральной системы происходит в файлах папки /handlers/
	Инициализация этого механизма такова:
		6.1) В charge_box.js создается объект OCPP, который инициализирует ChargingPointServer (entities/ChargingPointServer)
		6.2) ChargingPointServer через utils/SOAPWrapper создает принимающий сервер, который получает ChargePointService в качестве обработчика входящих соединений
		6.3) ChargePointService содержит маппер хэндлеров из папки /handlers/
		6.4) На каждый запрос есть свой хэндлер:
			changeConfiguration.js, clearCache.js и тд...
			Каждый из которых производит асинхронные манипуляции с БД.