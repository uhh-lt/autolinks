FROM openjdk:8-jdk

RUN set -ex \
      && DEBIAN_FRONTEND=noninteractive \
      && apt-get update \
      && apt-get install -y --no-install-recommends apt-utils locales maven \
      && sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen \
      && dpkg-reconfigure --frontend=noninteractive locales \
      && update-locale LANG=en_US.UTF-8 \
      && apt-get clean
ENV LANG en_US.UTF-8

RUN mkdir -p /opt/project

WORKDIR /opt/project

COPY pom.xml /opt/project/
COPY src /opt/project/src/

RUN set -ex \
      && mvn clean compile package -DskipTests \
      && rm /opt/project/target/*.jar*

CMD ["mvn","spring-boot:run", "-o"]