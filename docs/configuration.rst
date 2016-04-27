Configuration
=============

Ticket lifetime
---------------
If you use the queueing feature of the gatekeeper, every ticket that you get will have an expiration date.

There are two different values that determine the lifetime of a ticket in the queue.
The first is for tickets that are inside the queue (e.g. place 3) and is called **QUEUED_TICKET_LIFETIME**,
the other one is called **CURRENT_TICKET_LIFETIME** and determines the lifetime of the ticket that is 'first in queue'.

If you receive a "status ok" on your call für a queued ticket, the expiration date will be renewed with the **CURRENT_TICKET_LIFETIME**,
otherwise it will use the **QUEUED_TICKET_LIFETIME** to calculate the new expiration date.

This values (in minutes) can be configured in ``app/config.py``.

Default values are (at the moment) **720 minutes** for **CURRENT_TICKET_LIFETIME** and **2 minutes** for **QUEUED_TICKET_LIFETIME**

Environment specific configuration
----------------------------------

Configuration files have to be stored in **/resources** as .json format and should be named
after the applicable **environment**.

There has to be a **/resources/default.json** . This configuration will always be loaded. Only environment specific
configurations you state will then be overwritten.

Example Configuration
---------------------

- Hour range is from **0** until **24** o'clock.
- Days range is from **0** for Monday until **6** for Sunday.

Example config file::

    {
      "app": {
        "live": {
          "business_time_mo_to_do": {
            "hours_range": [
              8,
              16
            ],
            "days_range": [
              0,
              3
            ]
          },
          "business_time_fr": {
            "hours_range": [
              8,
              14
            ],
            "days_range": [
              4,
              4
            ]
          }
        }
      },
      "mongo": {
        "uris": [
            "mongodb://usename:password@somedbmaschine/database"
        ],
        "database": "database",
        "collection": "gatekeeper"
      }
    }

Rules
-----
The rules define the time when gates can be accessed via API. Outside of these times, the gates will always be closed
for API calls.

The rules have the following format::

    {
      "app": {
        "<environment>": {
          "<rule name>: {
            "hours_range": [
              <start>,
              <end>
            ],
            "days_range": [
              <start>,
              <end>
            ]
          }
        }
      }
    }


