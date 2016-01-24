#!/usr/bin/env bash

if [ ! -d "venv" ]; then
    ./setup.sh
fi

if [ -z "${1}" ]; then
    environment="test"
else
    environment="${1}"
fi

./venv/local/bin/python -m tests.test_api $environment
exit_codes=$?

./venv/local/bin/python -m tests.test_business_rules $environment
exit_codes=$(( $exit_codes + $? ))

./venv/local/bin/python -m tests.test_validate_tickets $environment
exit_codes=$(( $exit_codes + $? ))

if [ $exit_codes -eq 0 ]; then
    exit 0
else
    exit 1
fi
