@echo off
echo starting backend server...

cd backend
.\env\Scripts\python manage.py runserver

pause