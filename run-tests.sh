#!/usr/bin/env bash
set -e
source which-python.sh

if [ -z "${1}" ]; then
    environment="test"
else
    environment="${1}"
fi

${PYTHON} -m tests.test_api $environment
exit_codes=$?

${PYTHON} -m tests.test_business_rules $environment
exit_codes=$(( $exit_codes + $? ))

${PYTHON} -m tests.test_validate_tickets $environment
exit_codes=$(( $exit_codes + $? ))

if [ $exit_codes -eq 0 ]; then
    exit 0
else
    exit 1
fi
