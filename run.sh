#!/usr/bin/env bash
set -e

source which-python.sh

if [ -z "${1}" ]; then
    ${PYTHON} run.py "local" 8080
else
    ${PYTHON} run.py "${1}" 8080
fi