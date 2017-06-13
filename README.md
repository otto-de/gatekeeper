# Introducing the **Gatekeeper**

Manages environments, regulates deploys, advises pipelines and facilitates communication.

Readme to short? [Read the docs!](http://otto-gatekeeper.rtfd.org)

## About

The Gatekeeper manages deploys from multiple pipelines to multiple environments in one single place.
With this functionality, the Gatekeeper can be used as a ticketing system for sequential parts of your
deployment pipeline.

The Gatekeeper is in full use for deployments of otto.de since January 2016. Currently, one of the teams manages 10
micro services using the gatekeeper.

We use the Gatekeeper as the communication tool around deploys to servers. The Gatekeeper gives us enough confidence
to let the pipelines just roll.

## Getting Started

- Obtaining it from source:

````bash
    $ git clone git@github.com:otto-de/gatekeeper.git
````

- Installing from Source:

````bash
    $ ./setup.sh [OPTIONS]
````
    Options:
        --no-venv   Installs packages globally. May need root privileges.  
        --doc-deps  Includes depedencies to generate documentation.

- Run gatekeeper:

````bash
    $ ./run.py [OPTIONS]
    
    Options:
        -p <port>      Port to access UI. Default is 8080
        -e <env>       Sets Environment config file. Default is local.
        -v             Enables debug mode. Default is off.
````

- Run tests:

````bash
    $ ./run-tests.sh <environment>
````

## Contribute

The Gatekeeper is currently in active development and welcomes code improvements, bug fixes, suggestions and feature
requests. For those of your interested, providing documentation to other parties is equally welcome.

## License

Distributed under the Apache License 2.0
