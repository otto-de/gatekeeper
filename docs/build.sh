#!/usr/bin/env bash
cd "$(dirname "$0")"

SPHINX=../venv/bin/sphinx-build
if [ ! -f ${SPHINX} ]; then
    echo -e "\e[1m\e[31mCould not find sphinx to generate docs. Please run 'setup.sh --doc-deps'.\e[0m"
    exit 1
fi

make html SPHINXBUILD="${SPHINX}"
