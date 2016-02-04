#!/usr/bin/env bash
set -e

DEBUG=false
PORT=8080
ENVIRONMENT="local"

usage() { echo "Usage: $0 [-p <port>] [-e <environment>] [-v]" 1>&2;
	  echo "Options:"
	  echo "	-p <Port>           Specify port. Default is ${PORT}."
	  echo "	-e <Environment>    Specify which config to load. Default is ${ENVIRONMENT}."
	  echo "	-v                  Enables debug mode."
          exit 1; }

while getopts "e:p:vh" opt; do
  case $opt in
    v)
      echo "Enable debug mode" >&2
      DEBUG=true
      ;;
    p)
      echo "Port set to ${OPTARG}" >&2
      PORT=$OPTARG
      ;;
    e)
      echo "Environment set to ${OPTARG}" >&2
      ENVIRONMENT=$OPTARG
      ;;
    h)
      usage
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      usage
      ;;
  esac
done

source which-python.sh

if $DEBUG; then
    echo "Running debug"
    RUN=run.py
else
    echo "Running productive"
    RUN=runp.py
fi

${PYTHON} ${RUN} ${ENVIRONMENT} $PORT