Usage
=====

Create a new gate
-----------------

To create a gate for specific environments run the example below.

.. code-block:: guess

    $ curl -v -H "Content-Type: application/json" -X POST \
        -d '{"group": "team12", "environments": ["testing","production"]}' \
        http://gatekeeper.com/api/services/<myservicename>

The group parameter is used to define different gates for each team that is working on the application.
Please be advised that your service name must be unique. The gate name **must not** contain dots.

Change state of a gate
----------------------

To change one specific gate to one to **open** or **closed**.

.. code-block:: guess

    $ curl -v -H "Content-Type: application/json" -X PUT \
        -d '{"state": "closed"}' \
        http://gatekeeper.com/api/services/<myservicename>/<environment>


Use the queue
-------------

To use the queue feature you can send a put to the ``/api/services`` endpoint with ``queue=true``.

The Response holds your ticket with a timestamp and a token.

**Example**

.. code-block:: guess

    $ curl -v -H "Content-Type: application/json" -X POST \
        -d '{"service": ["myservicename"], "pipeline": ["mylivegate"]}' \
        http://gatekeeper.com/api/services?queue=true

**Response**

.. sourcecode:: http

    HTTP/1.1 200 OK
    Content-Type: application/json

.. code-block:: json

    {
        "status": "queued",
        "ticket": [
            "8fb0cefd-34b9-4094-8cb4-8198e4f95737"
            1445954199.022344
        ]
    }
