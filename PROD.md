[돌아가기](https://github.com/LEEJ0NGWAN/FreeChart#개발자-문서)

# 목차
- [Production 배포 설정 방법](#Production-배포-설정-방법)  

- [Production 시작 방법](#Production-시작-방법) 

- [Production 업데이트 방법](#Production-업데이트-방법)

## Production 배포 설정 방법

- 요구 사항
    - AWS EC2 혹은 FreeChart를 실행시킬 수 있는 컴퓨터

        (git, docker, docker-compose가 설치 되어 있어야합니다.)

    - 개인 도메인

        위의 컴퓨팅 서비스와 연결 되어 있어야합니다.

    - Daum 스마트워크 SMTP

        위의 개인 도메인과 연결된 다음의 스마트워크 계정이 필요합니다.

- 프로젝트 다운로드 (필수)

    ec2의 터미널에서 다음의 명령어를 실행합니다.

```jsx
git clone https://github.com/LEEJ0NGWAN/FreeChart.git
```

- 데이터베이스 환경 변수 설정 (선택)

    ec2의 터미널에서 다음의 명령어를 실행합니다.

```jsx
// 홈 디렉토리에 프로젝트가 있다고 가정합니다.

// git에서 변경 사항을 무시하도록 설정합니다.
git update-index --assume-unchanged ~/FreeChart/postgres.env

// vim으로 api 서버의 환경 파일 진입
sudo vim ~/FreeChart/postgres.env
```

      환경 변수는 다음과 같습니다.

```jsx
// DB의 이름
POSTGRES_DB=freechart-monolithic-prod

// DB에 접속할 유저와 패스워드
POSTGRES_USER=freechart
POSTGRES_PASSWORD=freechart
```

- api 서버 환경 변수 설정 (필수)

    ec2의 터미널에서 다음의 명령어를 실행합니다.

```jsx
// 홈 디렉토리에 프로젝트가 있다고 가정합니다.

// git에서 변경 사항을 무시하도록 설정합니다.
git update-index --assume-unchanged ~/FreeChart/back/.env

// vim으로 api 서버의 환경 파일 진입
sudo vim ~/FreeChart/back/.env
```

      환경 변수는 다음과 같습니다.

```jsx
// 어떤 모드로 실행할 지 설정합니다.
// LOCAL, PROD
MODE=PROD

// DJANGO에서 사용할 SECRET KEY를 설정합니다.
SECRET_KEY=SECRET_KEY

// 데이터베이스 설정 입니다.
// 반드시, 데이터베이스의 환경 변수와 동일하게 설정해주세요!!!!
// (데이터베이스의 환경 변수를 따로 수정하지 않았다면 수정할 필요가 없습니다.)
DB_NAME=freechart-monolithic-prod
DB_HOST=psql
DB_USER=freechart
DB_PASSWORD=freechart

// SMTP를 위한 다음 스마트워크의 아이디와 비밀번호를 입력합니다.
EMAIL_HOST_USER=아이디
EMAIL_HOST_PASSWORD=비밀번호

// 개인 도메인을 입력합니다
HOST_NAME=freechart.tk
```

- 프론트 애플리케이션 환경 변수 설정 (필수)

    ec2의 터미널에서 다음의 명령어를 실행합니다.

```jsx
// 홈 디렉토리에 프로젝트가 있다고 가정합니다.

// git에서 변경 사항을 무시하도록 설정합니다.
git update-index --assume-unchanged ~/FreeChart/front/.env

// vim으로 프론트 애플리케이션 환경 파일 진입
sudo vim ~/FreeChart/front/.env
```

      환경 변수는 다음과 같습니다.

```jsx
// api 서버의 호스트를 입력합니다.
// 이때, api 서버 호스트는 다음의 규칙을 따릅니다.
// http://도메인이름/api

REACT_APP_API_HOST=http://freechart.tk/api
```

- Docker 이미지 빌드 (필수)

    ec2의 터미널에서 다음의 명령어를 실행합니다.

```jsx
// 홈 디렉토리에 프로젝트가 있다고 가정합니다.

// 프로젝트 루트로 이동
cd ~/FreeChart

// docker-compose를 이용하여 이미지 필드
sudo docker-compose build
```

<br/>

[목차로 돌아가기](#목차)

## Production 시작 방법

(Production의 설정을 완료했다고 가정합니다.)

ec2의 터미널에서 다음의 명령어를 실행합니다.

```jsx
// 홈 디렉토리에 프로젝트가 있다고 가정합니다.

// 프로젝트 루트로 이동
cd ~/FreeChart

// docker-compose로 다중 컨테이너 동시 실행
sudo docker-compose up
```

<br/>

[목차로 돌아가기](#목차)

## Production 업데이트 방법

프론트 애플리케이션이나 api 서버를 새로 업데이트 해야 하는 경우입니다.

- 코드 업데이트

    ec2의 터미널에서 다음의 명령어를 실행합니다.

```jsx
// 홈 디렉토리에 프로젝트가 있다고 가정합니다.

// 프로젝트 루트로 이동
cd ~/FreeChart

// master 브랜치 pull
git pull origin master
```

- 프론트 애플리케이션 업데이트의 경우

    ec2의 터미널에서 다음의 명령어를 실행합니다.

```jsx
// 홈 디렉토리에 프로젝트가 있다고 가정합니다.

// 프로젝트 루트로 이동
cd ~/FreeChart

// 실행 중인 컨테이너들 실행 중지
sudo docker-compose down

// front 서비스와 nginx 서비스가 공유하는 볼륨을 삭제
sudo docker volume rm freechart_front_app

// front 이미지 삭제
sudo docker image rm freechart_front

// front 이미지 빌드
sudo docker-compose build front

// 컨테이너 실행
sudo docker-compose up
```

- api 서버 업데이트의 경우

    ec2의 터미널에서 다음의 명령어를 실행합니다.

```jsx
// 홈 디렉토리에 프로젝트가 있다고 가정합니다.

// 프로젝트 루트로 이동
cd ~/FreeChart

// 실행 중인 컨테이너들 실행 중지
sudo docker-compose down

// front 이미지 삭제
sudo docker image rm freechart_back

// front 이미지 빌드
sudo docker-compose build back

// 컨테이너 실행
sudo docker-compose up
```



