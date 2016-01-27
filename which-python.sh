#!/bin/bash

set -e

if [ -d ./venv ]; then
  PYTHON=./venv/bin/python
else
  PYTHON=python
fi

export PYTHON

