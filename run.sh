#!/usr/bin/env bash
if [ -z "${1}" ]; then
    ./venv/local/bin/python run.py "local" 8080
else
    ./venv/local/bin/python run.py "${1}" 8080
fi
