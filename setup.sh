#!/usr/bin/env bash
./get-pip.sh
python get-pip.py --user

python -m pip install --user virtualenv
python -m virtualenv venv

source venv/bin/activate

python -m pip install pymongo flask datetime tzlocal python-dateutil humanize babel

python -m pip install Sphinx sphinxcontrib-httpdomain

git clone -c http.sslVerify=false https://github.com/myusuf3/delorean.git
cd delorean
python setup.py install
cd ..
rm -rf delorean

deactivate
