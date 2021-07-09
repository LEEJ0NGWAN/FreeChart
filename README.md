<br/><br/>

**+2021.07.09**

**AWS 요금 문제 및 도메인 유효 기간 만료로 인해, FreeChart 서비스 웹 배포는 중지하게 되었습니다.**

<br/><br/>

# FreeChart

React.js, Django Rest Framework, docker로 개발된 웹 기반 네트워크 그래프 작성 애플리케이션입니다.

## 어떻게 사용됩니까?

- 사용 환경

디바이스 종류와 상관 없이 와이파이와 웹 브라우저만 있다면 어디서나 사용 가능합니다.

- 사용 용도

키워드를 모양으로 나타내고, 각 키워드를 서로 연결해서 관계를 나타내는 그림을 작성합니다.

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

## 특징

### SPA (Single Page Application)

- 모든 동작이 하나의 페이지에서만 이루어지도록 만들었습니다.

- react-router-dom 라이브러리를 이용하여 리액트 컴포넌트 라우팅을 구현합니다.

### Redux pattern

<img src="/README/reducers.png" width="70%" height="70%">

- 여러 컴포넌트에서 공통으로 사용하는 데이터는 각 종류 별 reducer가 관리하며 하나의 store에 저장합니다.

- react-thunk 패키지를 통해, api 호출 action은 비동기적으로 dispatch를 수행하여 정보를 저장합니다.

### ORM

- Django, Django Rest Framework를 이용하여, 데이터를 도메인 객체로 맵핑하는 ORM을 사용합니다.

### JWT

- 기존의 세션 대신 JWT 토큰을 이용하여 사용자를 인증하는 방식을 적용시켰습니다.

- 사용자는 최대 2주 동안 접속을 유지할 수 있습니다.

### Docker (with Docker-compose)

<img src="/README/docker.png">

- 컨테이너 기반으로 구동하는 방식을 사용합니다.
- 각 컴포넌트들이 사용하는 자원을 최적으로 줄이고, 각 컴포넌트들의 버전을 쉽게 관리할 수 있도록 도커라이징을 적용했습니다.

## 프로젝트 Problem

### 유지보수 및 확장 문제

- 백엔드 서버 개발에서 MVT(spring의 MVC) 패턴의 컴포넌트들을 기준으로 디렉토리를 구조화하고 단위테스트를 작성하지 않았기 때문에 디버깅과 기능 확장에 문제가 있었습니다.
- 이를 개선하기 위해, 각 서비스를 기준으로 디렉토리를 재구조화하고 MVT(spring의 MVC) 패턴의 컴포넌트들을 서비스 별로 집합시켰습니다.

### 성능 문제

- 그래프를 구성하는 데이터를 백엔드 서버 DB에 저장하는데, 그래프가 복잡한 경우 많은 데이터를 요구하기 때문에 DB에서 쿼리를 날리고 그래프 구성 데이터를 가져오는 시간이 오래 걸리는 문제가 있었습니다.
- 벌크 업데이트 및 삽입 쿼리를 이용하여 데이터 로딩 속도를 개선시켰습니다.

### 중복 코드 문제

- 코드를 작성하다보면 사용자 인증이나 시리얼라이징처럼 중복으로 작성되는 부분이 있었습니다.
- 공통된 로직을 모듈화하고 유틸 디렉토리로 관리하였습니다.

# 개발자 문서
- [api](API.md)

- [Local 개발 설정 방법](LOCAL.md)  

- [Production 설정 방법](PROD.md)  

- [Docker 관련 사항](DOCKER.md)  

- [ERD](ERD.md)  

