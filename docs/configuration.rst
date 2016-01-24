Configuration
=============
Configuration files have to be stored in **/resources** as .json format and should be named
after the applicable **environment**.

There has to be a **/resources/default.json** . This configuration will always be loaded. Only environment specific
configurations you state will then be overwritten.

Example
-------

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


