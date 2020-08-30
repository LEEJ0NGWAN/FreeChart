echo Collect static files
python3 manage.py collectstatic --clear --noinput # clearstatic files
python3 manage.py collectstatic --noinput  # collect static files

echo Starting DRF
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py runserver 0.0.0.0:8000

