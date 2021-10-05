FROM jjanzic/docker-python3-opencv:latest

COPY backend /app
WORKDIR /app

ARG SUPABASE_KEY
ARG SUPABASE_URL
ARG PORT=5000

#jpeg support
RUN apt-get update
RUN apt-get install libsm6 libxext6 libgl1-mesa-glx -y
RUN apt-get install libjpeg-dev
#tiff support
RUN apt-get install libtiff-dev
#freetype support
RUN apt-get install libfreetype6-dev
#openjpeg200support (needed to compile from source)
RUN wget http://downloads.sourceforge.net/project/openjpeg.mirror/2.0.1/openjpeg-2.0.1.tar.gz
RUN tar xzvf openjpeg-2.0.1.tar.gz
RUN cd openjpeg-2.0.1/
RUN apt-get install cmake
RUN cmake openjpeg-2.0.1
RUN make install
RUN apt-get install libsm6 libxext6 libgl1-mesa-glx -y

# RUN pip3 install pipenv
# RUN pipenv sync
RUN pip install Pillow
RUN pip install autocrop
RUN pip install flask
RUN pip install python-dotenv
RUN pip install supabase
RUN pip install flask-cors
EXPOSE ${PORT}

CMD ["python3", "main.py"]
