#!/bin/bash
echo "starting backend server..."

cd ..
cd ./backend || exit 1

if [ -d "myenv/bin" ]; then
    echo "Using Linux Python environment..."
    source ./myenv/bin/activate
    pip install -r requirements.txt
    python manage.py runserver
else
    echo creating virtual environment...
    echo front server lancé...
    python -m venv myenv
    source ./myenv/bin/activate
    pip install -r requirements.txt
    python manage.py runserver
fi

read -p "Press Enter to continue..."
