..  Gatekeeper documentation master file, created by
    sphinx-quickstart on Mon Oct 12 12:49:48 2015.
    You can adapt this file completely to your liking, but it should at least
    contain the root `toctree` directive.

Gatekeeper Documentation
========================

For multiple services many pipelines are required, while in each pipeline different servers can be provisioned.
A pipeline naturally does not know anything about the state of a server. To give any pipeline for any service all
relevant information which server can be provisioned (or not) the Gatekeeper was built.

The Gatekeeper manages the gates to different environments (e.g.”test-server”, “integration-server”, “production-server”).
In this way you can manage the provisioning of all your servers for all your pipelines in one single place.
The gates to the servers can be closed in the UI, using an API, by defining “business hours” (outside which no deploy
should start) and to ensure mutual exclusion. A small comment field enhances the communication about deployment issues
but also ensures, that documentation is reduced to a minimum and easy to keep up to date.

Those features enable to the Gatekeeper not only to display the status (open/closed) of a certain gate.
The Gatekeeper provides a full stack queueing system for your releases.

Our Usage
---------

The Gatekeeper is in full use for deployments of otto.de since January 2016. Currently, one of the teams manages 10
micro services using the gatekeeper.

We use the Gatekeeper as the communication tool around deploys to servers. The Gatekeeper gives us enough confidence
to let the pipelines just roll.


Getting Started
---------------
To start the service just run:

    .. code::

        $ ./run.sh [OPTIONS]

    **Options**::

        -p <port>           Port. Default 8080.

        -e <environment>    Specifies environment configuration file. Default is local.

        -v                  Enable debug mode.


Guide
=====

.. toctree::
    :maxdepth: 2

    install
    configuration
    usage
    api
    contribution
    license


Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`