#!./venv/bin/python
# -*- coding: utf-8 -*-
import argparse
import logging

from app.app import create_app

parser = argparse.ArgumentParser(
    description='Jellyfish is a service to monitor the health and status of services running in Marathon.')
parser.add_argument('-p', '--port', nargs='?', default=8080,
                    help='Port: Specify port. Default is 8080')
parser.add_argument('-e', '--env', nargs='?', default="local",
                    help='Environment: Specify which config to load. Default is local.')
parser.add_argument('-w', '--workdir', nargs='?', default="./",
                    help='Workdir: Specify which working directory to use. Default is the local directory')
parser.add_argument('-g', '--greedy', action='store_true',
                    help='Greedy: Run processes once (synchron) and then start to serve.')
parser.add_argument('-v', '--verbose', nargs='?', const="DEBUG", default="WARN",
                    help='Lets you set the loglevel. Application default: WARN. Option default: DEBUG')  # without param->const. If no present->default
args = parser.parse_args()

log_level = logging.getLevelName(args.verbose)
logging.basicConfig(level=log_level,
                    datefmt='%d-%m %H:%M:%S',
                    format='%(asctime)s %(name)-s %(levelname)-s %(message)s')

print("\n\x1b[32mApplication staring...\x1b[0m")
print(" Port: " + str(args.port))
print(" Environment: " + str(args.env))
print(" Workdir: " + str(args.workdir))
print(" Greedy: " + str(args.greedy))
print(" Logging: " + str(args.verbose))
print("\x1b[32m========================\x1b[0m")
app = create_app(port=args.port, environment=args.env)
app.run(debug=True, use_reloader=False, port=args.port, host='0.0.0.0')
