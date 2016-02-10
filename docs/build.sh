#!/usr/bin/env bash
cd "$(dirname "$0")"
make html SPHINXBUILD='../venv/bin/sphinx-build'
