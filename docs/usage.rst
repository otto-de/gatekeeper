Usage
=====

Create a new gate
-----------------

To create a gate for specific environments run the example below.

.. code-block:: guess

    $ curl -v -H "Content-Type: application/json" -X POST \
        -d '{"group": "team12", "environments": ["testing","production"]}' \
        "http://gatekeeper.com/api/services/<myservicename>"

The group parameter is used to define different gates for each team that is working on the application.
Please be advised that your service name must be unique. The gate name **must not** contain dots.

Change state of a gate
----------------------

To change one specific gate to one to **open** or **closed**.

.. code-block:: guess

    $ curl -v -H "Content-Type: application/json" -X PUT \
        -d '{"state": "closed"}' \
        "http://gatekeeper.com/api/services/<myservicename>/<environment>"


Use the queue
-------------

To use the queue feature you can send a put to the ``/api/services`` endpoint with ``queue=true``.

The Response holds your ticket with a timestamp and a token.

**Example**

.. code-block:: guess

    $ curl -v -H "Content-Type: application/json" -X PUT \
        -d '{"services": { "myservicename": ["mylivegate"], "myservicepipeline": ["mylivegate"]}, "link": "https://github.com/otto-de/gatekeeper"}' \
        "http://gatekeeper.com/api/services?queue=true"

**Response**

.. sourcecode:: http

    HTTP/1.1 200 OK
    Content-Type: application/json

.. code-block:: json

    {
        "status": "ok"
        "ticket": {
            "expiration_date": 0,
            "updated": "2016-01-26 09:35:18+0100",
            "link": "https://github.com/otto-de/gatekeeper",
            "id": "4ca72ee9-82b9-48c5-bf66-994ac907386b"
        }
    }

If you are first in line, your ticket will not expire ("expiration_date": 0). You should delete it afterwards.

Every other ticket will be valid for 2 minutes and you can refresh your ticket by including the ticket id in your request. See example below.

**Example**

.. code-block:: guess

    $ curl -v -H "Content-Type: application/json" -X PUT \
        -d '{"services": { "myservicename": ["mylivegate"], "myservicepipeline": ["mylivegate"]}, "link": "https://github.com/otto-de/gatekeeper", "ticket": "4ca72ee9-82b9-48c5-bf66-994ac907386b"}' \
        "http://gatekeeper.com/api/services?queue=true"

**Response**

.. sourcecode:: http

    HTTP/1.1 200 OK
    Content-Type: application/json

.. code-block:: json

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
        "http://gatekeeper.com/api/tickets/4ca72ee9-82b9-48c5-bf66-994ac907386b"

**Response**

.. sourcecode:: http

    HTTP/1.1 200 OK
    Content-Type: application/json

.. code-block:: json

    {
        "status": "ok"
    }
