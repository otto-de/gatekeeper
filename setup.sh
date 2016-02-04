#!/usr/bin/env bash

VENV=true
DOCS_DEPS=false

usage() { echo "Usage: $0 [--no-venv] [--doc-deps]" 1>&2;
	  echo "Options:"
	  echo "	--no-venv   Install packages globally. May need root privileges."
	  echo "	--doc-deps	Includes dependencies to generate docs (ie. Sphinx)."
          exit 1; }

while getopts "h-:" opt; do
  case $opt in
    -)
      case $OPTARG in
        no-venv)
            echo "venv disabled."
            VENV=false
            ;;
        doc-deps)
            echo "Includes dependencies to generate docs"
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
  echo "Using VirtualEnv"
  python -m pip install --user virtualenv
  python -m virtualenv venv
  source venv/bin/activate
}

if [ ! -f "get-pip.py" ]; then
    ./get-pip.sh
fi

python get-pip.py --user

if $VENV; then
  useVirtualEnv
else
  echo "Installing packages globally"
fi

python -m pip install pymongo flask datetime tzlocal python-dateutil humanize babel

if $DOCS_DEPS; then
    python -m pip install Sphinx sphinxcontrib-httpdomain
fi

git clone -c http.sslVerify=false https://github.com/myusuf3/delorean.git
cd delorean
python setup.py install
cd ..
rm -rf delorean
