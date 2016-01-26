Api Endpoints
=============

api/services/<myservicename>
----------------------------

POST
~~~~
.. http:post:: api/services/<myservicename>

   This endpoint will create a new service with the gates given.

   Default values for all gates is **open**.

   Your Service name must be unique. The gate name **must not** contain dots.

   **Example request**:

   .. sourcecode:: http

      POST /services/awesome_service HTTP/1.1
      Content-Type: application/json
      Payload: {
                    "group": "team12",
                    "environments": [
                        "testing",
                        "mylivegate"
                    ]
                }


   **Positiv response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
        "status": "ok"
      }

   :reqheader Accept: application/json
   :resheader Content-Type: application/json
   :statuscode 200: no error
   :statuscode 400: Your json contains invalid information
   :statuscode 400: Json was not valid
   :statuscode 400: Gate with this name already exist

GET
~~~~
.. http:get:: api/services/<myservicename>

   Will get you the state of the gates in json format.

   **Example request**:

   .. sourcecode:: http

      GET /services/awesome_service HTTP/1.1
      Accept: application/json

   **Example response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
        "name": "awesome_service",
        "group": "team12",
        "environments": {
            "mylivegate": {
                "queue": [],
                "message_timestamp": "",
                "state": "closed",
                "message": "",
                "state_timestamp": "2015-10-27 12:05:38+0100"
            }
        }
      }

   :reqheader Accept: application/json
   :resheader Content-Type: application/json
   :statuscode 200: no error
   :statuscode 400: Json was not valid
   :statuscode 400: Gate with this name already exist

DELETE
~~~~~~
.. http:delete:: api/services/<myservicename>

   Will remove a gate.

   **Example request**:

   .. sourcecode:: http

      DELETE api/services/awesome_service HTTP/1.1
      Accept: application/json

   **Example response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
        "status": "ok"
      }

   **Error response**:

   .. sourcecode:: http

      HTTP/1.1 400 BAD REQUEST
      Content-Type: application/json

      {
        "status": "error"
        "reason": "Json was not valid"
      }

   :reqheader Accept: application/json
   :resheader Content-Type: application/json
   :statuscode 200: no error
   :statuscode 400: Json was not valid
   :statuscode 400: Gate with this name already exist
   :statuscode 400: Your json contains invalid information
   :statuscode 500: Can not write to database

api/services/<myservicename>/<environment>
-----------------------------------------

PUT
~~~~
.. http:put:: api/services/<myservicename>/<environment>

   Lets you set the state of one single gate.

   Only valid options are **open** and **close**.

   **Example request**:

   .. sourcecode:: http

      PUT api/services/awesome_service/live HTTP/1.1
      Content-Type: application/json

      {
        "state": "closed",
        "message": "I want to do some testing. -Jens"
      }


   **Positiv response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
        "status": "ok"
      }

   :reqheader Accept: application/json
   :resheader Content-Type: application/json
   :statuscode 200: no error
   :statuscode 400: Json was not valid
   :statuscode 400: state must be open or closed
   :statuscode 404: Gate not found
   :statuscode 500: Can not write to database

api/services
------------

PUT
~~~~
.. http:put:: api/services

   With this you can close multiple gates at once and its provides a test-and-set functionality, which means that you only get a
   positive response if none of the gates you asking for is already closed.

   This is useful if you want two gates to be mutually exclusive. As example we do not want to deploy our pipeline, if the pipeline is involved in an live deployment of an other service.

   **Example request**:

   .. sourcecode:: http

      PUT api/services HTTP/1.1
      Content-Type: application/json

      {
        "services": {
            "service12": ["myservicename"],
            "pipeline": ["meta"]
        }
      }

   **Positiv response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
        "status": "ok",
        "ticket": {
            "expiration_date": 0,
            "updated": "2016-01-26 09:35:18+0100",
            "link": "https://github.com/otto-de/gatekeeper",
            "id": "4ca72ee9-82b9-48c5-bf66-994ac907386b"
        }
      }

   **Negativ response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
        "status": "denied"
      }

   **Queued response**:

   If the ``queue=true`` query is used and the gate is closed, you receive "queued" as response.

   The ticket you get will be valid for 2 minutes. With every subsequent requests that includes the ticket id the tickets
   expiration date will be refreshed.

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
        "status": "queue",
        "ticket": {
            "expiration_date": 1453799405.26424,
            "updated": "2016-01-26 09:35:18+0100",
            "link": "https://github.com/otto-de/gatekeeper",
            "id": "4ca72ee9-82b9-48c5-bf66-994ac907386b"
        }
      }

   **Example request with queued ticket**:

   To include your ticket id use the following request structure:

   .. sourcecode:: http

      PUT api/services HTTP/1.1
      Content-Type: application/json

      {
        "services": {
            "service12": ["myservicename"],
            "pipeline": ["meta"]
        },
        "ticket": "4ca72ee9-82b9-48c5-bf66-994ac907386b"
      }

   **Positiv Queued response**:

   The ticket expiration_date will be set to 0.

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
        "status": "ok",
        "ticket": {
            "expiration_date": 0,
            "updated": "2016-01-26 09:35:18+0100",
            "link": "https://github.com/otto-de/gatekeeper",
            "id": "4ca72ee9-82b9-48c5-bf66-994ac907386b"
        }
      }

   **Negativ Queued response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
        "status": "denied"
      }

   **Still Queued response**:

   If its not yet your turn, the status will remain as ``queue``.

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
        "status": "queue",
        "ticket": {
            "expiration_date": 1453799405.26424,
            "updated": "2016-01-26 09:35:18+0100",
            "link": "https://github.com/otto-de/gatekeeper",
            "id": "4ca72ee9-82b9-48c5-bf66-994ac907386b"
        }
      }

   :query queue=true: creates a ticket and uses queueing
   :reqheader Accept: application/json
   :resheader Content-Type: application/json
   :statuscode 200: no error
   :statuscode 400: Json was not valid
   :statuscode 400: state must be open or closed
   :statuscode 404: Gate not found
   :statuscode 500: Can not write to database

api/tickets/(ticket_id)
-----------------------

DELETE
~~~~~~
.. http:delete:: api/tickets/(ticket_id)

   This end

   **Example request**:

   .. sourcecode:: http

      DELETE api/tickets/8fb0cefd-34b9-4094-8cb4-8198e4f95737 HTTP/1.1
      Accept: application/json

   **Positiv response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
            "status": "ok"
      }

   :statuscode 200: no error
   :statuscode 404: Ticket does not exist