# FreeChart

[http://freechart.tk/](http://freechart.tk/)

React.js, Django Rest Framework, docker로 개발된 웹 기반 네트워크 그래프 작성 애플리케이션입니다.

## 어떻게 사용됩니까?

- 사용 환경

웹 애플리케이션으로, 디바이스 상관없이 와이파이와 웹 브라우저만 있다면 어디서나 사용 가능합니다.

- 사용 용도

중요 키워드를 모양으로 나타내고, 각각의 키워드를 서로 연결해서 관계를 나타내는 그림을 작성합니다.

마인드맵, 제조 공정도, 워크 프로세스, 관계도 등의 그래프를 작성하는데 사용될 수 있습니다.

<br/>

<여러 디바이스에서 실행한 예제>


<img src="/README/ipad.png" width="50%" height="50%">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="/README/iphoneX.png" width="20%" height="20%">

<img src="/README/MBP.png">

## 개발 스펙

### Front

- React.js (with yarn)
- React-redux
- React-router-dom
- vis-network

### Back

- Django
- DjangoRestFramework

### Other

- nginx
- PostgreSQL
- Redis
- Docker (Docker-compose)
- JWT authentication

## SPA (Single Page Application)

모든 동작이 하나의 페이지에서만 이루어지도록 만들었습니다.

react-router-dom 라이브러리를 이용하여 리액트 컴포넌트 라우팅을 구현합니다.

## Redux pattern

<img src="/README/reducers.png" width="70%" height="70%">

사용자 및 그래프 데이터와 같이 백엔드 서버로부터 api 호출을 통해 얻은 후, 여러 컴포넌트에서 공통으로 사용하는 데이터는 각 종류 별 reducer가 관리하며 하나의 store에 저장합니다.

react-thunk 패키지를 이용하여, api 호출과 같은 action은 비동기적으로 dispatch를 수행하여 정보가 저장 될 수 있도록 했습니다.

## ORM

Django, Django Rest Framework를 이용하여, 데이터를 객체로 맵핑하는 ORM을 사용합니다

이를 통해, SQL 쿼리문 없이 여러 DB 테이블의 데이터들을 조작할 수 있는 api를 만들었습니다.

## JWT

클라이언트와 서버 간의 통신이 이루어질 때, 기존의 세션이나 쿠키를 사용하는 대신에 JWT 토큰을 이용하여 인증하는 방식을 적용시켰습니다.

JWT 토큰의 refresh를 통해서, 일부로 로그아웃하지 않는 이상 사용자는 최대 2주 동안 접속이 유지되도록 했습니다. 이를 통해 사용자가 번거로운 로그인 과정 없이 이전 작업을 이어서 할 수 있도록 설정했습니다.

## Docker (with Docker-compose)

<img src="/README/docker.png">

컨테이너 기반으로 구동하는 방식을 통해, FreeChart 웹 애플리케이션의 각 컴포넌트들이 사용하는 자원을 최적으로 줄이고, 각 컴포넌트들의 버전을 쉽게 관리할 수 있도록 도커라이징을 적용했습니다.

docker-compose로 실행되는 서비스들은 다음과 같습니다.

- front

    프로덕션 배포용 front app을 빌드

    nginx 컨테이너와 volume을 공유

- back

    REST api 서버

- nginx

    front 컨테이너에서 빌드된 app을 탑재

    api request를 api 서버로 전달하는 proxy pass 수행

- postgreSQL

    사용자의 데이터를 저장하는 데이터베이스

- redis

    인증코드를 저장하는 key-value 데이터베이스

# 개발자 문서
- [api](API.md)

- [Local 개발 설정 방법](LOCAL.md)  

- [Production 설정 방법](PROD.md)  

- [Docker 관련 사항](DOCKER.md)  

- [ERD](ERD.md)  

- [향후 개선 계획](NEXTPLAN.md)  

