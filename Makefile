PYTHON := .venv/bin/python
install:
	python3 -m venv .venv
	$(PYTHON) -m pip install -r requirements.txt
up:
	$(PYTHON) manage.py runserver