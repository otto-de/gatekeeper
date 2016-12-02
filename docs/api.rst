Api Endpoints
=============

api/gates/<group_name>/<service_name>
-------------------------------------

POST
~~~~
.. http:post:: api/gates/<group_name>/<service_name>

   This endpoint will create a new service with the environments given.

   If the group does not exists, it will be created and represented as its own tab.

   Default values for all gates is **open**.

   Your Service name must be unique in that group. The gate name **must not** contain dots.

   **Example request**:

   .. sourcecode:: http

      POST /services/awesome_service HTTP/1.1
      Content-Type: application/json

      {
        "environments": [
            "testing",
            "my_live_gate"
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
   :statuscode 400: Service name not valid
   :statuscode 400: Group name not valid
   :statuscode 400: Json was not valid
   :statuscode 400: Service with this name already exist

PUT
~~~~
.. http:put:: api/gates/<group_name>/<service_name>

   Let you update a single service.

   If your payload includes **name**, **group** and/or **environments** it will update the given.

   **Example request**:

   .. sourcecode:: http

      POST /services/awesome_service HTTP/1.1
      Content-Type: application/json

      {
        "name": "new_awesome_name",
        "environments": [
            "totally_new_environment"
        ]
      }


   **Positiv response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
        "group": "new_awesome_name",
        "name": "team_12",
        "environments": {
          "totally_new_environment": {
            "queue": [],
            "message_timestamp": "",
            "state": "open",
            "message": "",
            "state_timestamp": "2016-04-27 22:29:49+0200"
          }
        }
      }

   :reqheader Accept: application/json
   :resheader Content-Type: application/json
   :statuscode 200: no error
   :statuscode 400: Your json contains invalid information
   :statuscode 400: Service name not valid
   :statuscode 400: Group name not valid
   :statuscode 400: Service name not valid
   :statuscode 400: Service with this name already exist

GET
~~~~
.. http:get:: api/gates/<group_name>/<service_name>

   Will get you the state of the gates in json format.

   **Example request**:

   .. sourcecode:: http

      GET api/gates/team_12/awesome_service HTTP/1.1
      Accept: application/json

   **Example response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
        "group": "awesome_service",
        "name": "team_12",
        "environments": {
          "develop": {
            "queue": [],
            "message_timestamp": "",
            "state": "open",
            "message": "",
            "state_timestamp": "2016-04-27 22:29:49+0200"
          }
        }
      }

   :reqheader Accept: application/json
   :resheader Content-Type: application/json
   :statuscode 200: no error
   :statuscode 400: Json was not valid
   :statuscode 400: Service with this name already exist

DELETE
~~~~~~
.. http:delete:: api/gates/<group_name>/<service_name>

   Will remove a service.

   **Example request**:

   .. sourcecode:: http

      DELETE api/gates/team_12/awesome_service HTTP/1.1
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

api/gates/<group_name>/<service_name>/<environment>
---------------------------------------------------

PUT
~~~~
.. http:put:: api/gates/<group_name>/<service_name>/<environment>

   Lets you set the state of one environment.

   If your payload includes 'state', 'message' it will update the given.

   Only valid options for state are **open** and **close**.

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
   :statuscode 404: not found
   :statuscode 404: environment not found
   :statuscode 500: Can not write to database

api/gates
---------

PUT
~~~~
.. http:put:: api/gates

   With this you can close multiple gates at once and it provides a test-and-set functionality, which means that you only get a
   positive response if none of the gates you asking for is already closed.

   This is useful if you want two gates to be mutually exclusive.

   As example we do not want to deploy our pipeline, if a deployment is currently in progress.

   **Example request**:

   .. sourcecode:: http

      PUT api/services HTTP/1.1
      Content-Type: application/json

      {
        "gates": {
          "team_applications": {
            "service_12": ["live"]
          },
          "team_pipelines": {
            "service_12_pipeline": ["live"]
          }
        },
        "link": "https://github.com/otto-de/gatekeeper"
      }

   **Positiv response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
        "status": "ok",
        "ticket": {
          "expiration_date": 1461833574.495491,
          "updated": "2016-04-27 22:52:54+0200",
          "id": "ec3fe716-2cc1-4a56-908b-7348910dbce0",
          "link": "https://github.com/otto-de/gatekeeper"
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

   In queue the ticket you get will be valid for 2 minutes. With every subsequent requests that includes the ticket id the tickets
   expiration date will be refreshed.

   Ticket lifetime for tickets in queue and in front of the queue can be configured.

   If the gate was closed manually the status will still be "denied".

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
        "gates": {
          "team_applications": {
            "service_12": ["live"]
          },
          "team_pipelines": {
            "service_12_pipeline": ["live"]
          }
        },
        "ticket": "4ca72ee9-82b9-48c5-bf66-994ac907386b"
      }


   **Positiv Queued response**:

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

api/tickets/<ticket_id>
-----------------------

DELETE
~~~~~~
.. http:delete:: api/tickets/<ticket_id>

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