@echo off
echo starting backend server...

cd backend
echo Activating virtual environment...
.\myenv\Scripts\activate
pip install -r requirements.txt
echo running django server...
python manage.py runserver
pause