#!/usr/bin/env bash

VENV=true
DOCS_DEPS=false

usage() { echo "Usage: $0 [--no-venv] [--doc-deps]" 1>&2;
          echo "Options:"
          echo "	--no-venv   Install packages globally. May need root privileges."
          echo "	--doc-deps  Includes dependencies to generate docs (ie. Sphinx)."
          exit 1; }

while getopts "h-:" opt; do
  case $opt in
    -)
      case $OPTARG in
        no-venv)
            VENV=false
            ;;
        doc-deps)
            DOCS_DEPS=true
            ;;
        *)
            echo "Invalid option: $OPTARG" >&2
            usage
            ;;
      esac
      ;;
    h)
      usage
      ;;
    *)
      echo "Invalid option: -$OPTARG" >&2
      usage
      ;;
  esac
done

useVirtualEnv() {
  echo -e "\e[1mPreparing VirtualEnv\e[0m"
  python -m pip install --user virtualenv
  python -m virtualenv venv
  source venv/bin/activate
}

python get-pip.py --user

if $VENV; then
  useVirtualEnv
else
  echo -e "\e[1m\e[31mInstalling packages globally. This may need root privileges.\e[0m"
fi

python -m pip install -r requirements.txt

if $DOCS_DEPS; then
    echo -e "\e[1mInstalling dependencies for docs\e[0m"
    python -m pip install -r docs/requirements.txt
fi
