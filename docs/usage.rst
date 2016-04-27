Usage
=====

Create a new gate
-----------------

To create a gate for specific environments run the example below.

.. code-block:: guess

    $ curl -v -H "Content-Type: application/json" -X POST \
        -d '{"environments": ["dev", "prod"]}' \
        http://gatekeeper.com/api/gates/team_12/service_12

The group parameter is used to define different gates for each team that is working on the application.
Please be advised that your service name must be unique. The gate name **must not** contain dots.

Check a gate
------------

To check the state of a gate, just get the resource:

.. code-block:: guess

    $ curl -v -H "Content-Type: application/json" -X GET \
        http://gatekeeper.com/api/gates/team_12/service_12/dev

**Response**

.. sourcecode:: http

    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "queue": [],
      "message_timestamp": "2016-04-27 23:24:00+0200",
      "state": "open",
      "message": "",
      "state_timestamp": "2016-04-27 23:23:52+0200"
    }


Change state of a gate
----------------------

To change one specific gate to one to **open** or **closed**.

.. code-block:: guess

    $ curl -v -H "Content-Type: application/json" -X PUT \
        -d '{"state": "closed"}' \
        http://gatekeeper.com/api/gates/team_12/service_12/dev

Set message for a gate
----------------------

To change one specific gate to one to **open** or **closed**.

.. code-block:: guess

    $ curl -v -H "Content-Type: application/json" -X PUT \
        -d '{"message": "some reason"}' \
        http://gatekeeper.com/api/gates/team_12/service_12/dev


Use the queue
-------------

To use the queue feature you can send a put to the ``/api/services`` endpoint with ``queue=true``.

The Response holds your ticket with a timestamp and a token.

**Example**

.. code-block:: guess

    $ curl -v -H "Content-Type: application/json" -X PUT \
        -d '{"gates": {"team_12": {"service_12": "prod"}}, "link": "https://github.com/otto-de/gatekeeper"}' \
        http://gatekeeper.com/api/gates?queue=true

**Response**

.. sourcecode:: http

    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "status": "ok"
      "ticket": {
        "expiration_date": 1461792546.190654,
        "updated": "2016-01-26 09:35:18+0100",
        "link": "https://github.com/otto-de/gatekeeper",
        "id": "4ca72ee9-82b9-48c5-bf66-994ac907386b"
      }
    }

If the expiration_date is 0, your ticket will not expire. You should delete it afterwards.

Every queued ticket will be valid for several minutes (default is 2) and you can refresh your ticket by including the ticket id in subsequent requests. See example below.

**Example**

.. code-block:: guess

    $ curl -v -H "Content-Type: application/json" -X PUT \
        -d '{"gates": {"team_12": {"service_12": "prod"}}, "ticket": "62d33ef2-acb6-4543-9084-c53e9e570cc4"}' \
        http://gatekeeper.com/api/gates?queue=true

**Response**

.. sourcecode:: http

    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "status": "queue"
      "ticket": {
        "expiration_date": 1453799405.26424,
        "updated": "2016-01-26 09:35:18+0100",
        "link": "https://github.com/otto-de/gatekeeper",
        "id": "4ca72ee9-82b9-48c5-bf66-994ac907386b"
      }
    }

Delete a ticket
---------------

To delete a ticket, just call DELETE on the ``/api/tickets/<ticket id>`` endpoint.

Be advised that deleting a ticket will never throw an error.

**Example**

.. code-block:: guess

    $ curl -v -H "Content-Type: application/json" -X DELETE \
        http://gatekeeper.com/api/tickets/4ca72ee9-82b9-48c5-bf66-994ac907386b

**Response**

.. sourcecode:: http

    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "status": "ok"
    }
