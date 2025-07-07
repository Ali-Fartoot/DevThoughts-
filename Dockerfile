FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /usr/src/app
COPY . /usr/src/app/
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY run.sh /run.sh
RUN chmod +x /run.sh
ENTRYPOINT ["/run.sh"]