#!/bin/bash

set -e

if [ -d ./venv ]; then
  VENV=./venv/bin/
  PYTHON=${VENV}python
else
  PYTHON=python
fi

export VENV
export PYTHON
