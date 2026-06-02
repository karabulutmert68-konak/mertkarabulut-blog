FROM python:3.12-slim AS base

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev gcc curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD python manage.py migrate --noinput && \
    python manage.py collectstatic --noinput && \
    python manage.py create_admin && \
    gunicorn core.wsgi --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120
