#!/usr/bin/env bash
set -e
if [ -d ./venv ]; then
  VENV=./venv/bin/
  PYTHON=${VENV}python3
else
  PYTHON=python3
fi
${PYTHON} -m unittest discover -s /home/jens/otto/gatekeeper/tests -t /home/jens/otto/gatekeeper
