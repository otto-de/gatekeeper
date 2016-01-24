Api Endpoints
=============

api/services/<myservicename>
---------------------------

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

.. http:put:: api/services/<myservicename>/<environment>

   Lets you set the state of one single gate.

   Only valid options are **open** and **close**.

   **Example request**:

   .. sourcecode:: http

      PUT api/services/awesome_service/live HTTP/1.1
      Content-Type: application/json
      Payload: {
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

.. http:put:: api/services

   With this you can close multiple gates at once and its provides a test-and-set functionality, which means that you only get a
   positive response if none of the gates you asking for is already closed.

   This is useful if you want two gates to be mutually exclusive. As example we do not want to deploy our pipeline, if the pipeline is involved in an live deployment of an other service.

   **Example request**:

   .. sourcecode:: http

      PUT api/services HTTP/1.1
      Content-Type: application/json
      Payload: {
                    "service12": ["myservicename"],
                    "pipeline": ["meta"]
                }


   **Positiv response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
            "status": "ok",
            "ticket": [
                "8fb0cefd-34b9-4094-8cb4-8198e4f95737" // Ticket id
                1445954199.022344                      // expiration date
            ]
      }

   **Queued response**:

   If the queue=true query is used and the gate is closed, you receive "queued" as response.

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
            "status": "queued",
            "ticket": [
                "8fb0cefd-34b9-4094-8cb4-8198e4f95737" // Ticket id
                1445954199.022344                      // expiration date
            ]
      }

   :query queue=true: creates a ticket
   :reqheader Accept: application/json
   :resheader Content-Type: application/json
   :statuscode 200: no error
   :statuscode 400: Json was not valid
   :statuscode 400: state must be open or closed
   :statuscode 404: Gate not found
   :statuscode 500: Can not write to database

api/tickets/(ticket_id)
-----------------------

.. http:get:: api/tickets/(ticket_id)

   If your request has been queued in, with this api you can see if its your turn.

   Every time you call this api, your ticket will be renewed (expiration date will be set to 2 minutes in the future).

   Requests with an expired or non existing ticket will always to a "Ticket not found" error.

   **Example request**:

   .. sourcecode:: http

      GET api/tickets/8fb0cefd-34b9-4094-8cb4-8198e4f95737 HTTP/1.1
      Accept: application/json

   **Positiv response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
            "status": "ok",
            "ticket": [
                "8fb0cefd-34b9-4094-8cb4-8198e4f95737" // Ticket id
                1445954199.022344                      // expiration date
            ]
      }

   :reqheader Accept: application/json
   :resheader Content-Type: application/json
   :statuscode 200: no error
   :statuscode 400: Json was not valid
   :statuscode 400: Ticket does not exist

.. http:delete:: api/tickets/(ticket_id)

   If your request has been queued in, with this api you can see if its your turn.

   Every time you call this api, your ticket will be renewed (expiration date will be set to 2 minutes in the future).

   Requests with an expired or non existing ticket will always to a "Ticket not found" error.

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