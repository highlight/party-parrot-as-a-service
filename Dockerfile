FROM python:3.9.7
COPY . /app
WORKDIR /app

ARG SUPABASE_KEY
ARG SUPABASE_URL

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update -y
RUN apt install libgl1-mesa-glx -y
RUN apt-get install 'ffmpeg'\
    'libsm6'\
    'libxext6'  -y
RUN pip3 install pipenv
RUN pipenv sync
EXPOSE 80

CMD ["pipenv run gunicorn main:app"]
