FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /usr/src/app
COPY . /usr/src/app/
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY start.sh /start.sh
RUN chmod +x /start.sh
ENTRYPOINT ["/start.sh"]