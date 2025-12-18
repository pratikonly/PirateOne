#!/bin/bash

python manage.py migrate --run-syncdb

python manage.py runserver 0.0.0.0:5000
