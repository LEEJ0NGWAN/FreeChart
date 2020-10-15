[돌아가기](https://github.com/LEEJ0NGWAN/FreeChart#개발자-문서)

# 목차
- [Local 개발 설정 방법](#Local-개발-모드-설정-방법)  

- [Local 개발 모드 실행 방법](#Local-개발-모드-실행-방법)  

## Local 개발 모드 설정 방법

(Mac OS에서 진행되었으며, 윈도우 환경에서 개발 설정 방법은 다를 수 있습니다.)

- 프로젝트 다운로드

    터미널에서 다음의 명령어를 실행합니다.

```jsx
// 프로젝트 설정들은 홈 디렉토리 아래에 프로젝트가 있음을 가정하고 진행합니다.
// 홈 디렉토리로 이동
cd

// 프로젝트 다운로드
git clone https://github.com/LEEJ0NGWAN/FreeChart.git
```

- 로컬 데이터베이스 설치

    터미널에서 다음의 명령어를 실행합니다. 

```jsx
// Homebrew 유틸을 이용하여 설치합니다.
// Homebrew가 없다면 먼저 Homebrew를 설치하거나, 
// postgreSQL과 redis를 각각의 공식 홈페이지에서 직접 설치해주세요.
brew install postgresql redis

// postgreSQL과 redis가 동작하고 있는지 확인
brew services

// 설치 완료 후, postgreSQL 연결
psql

// 로컬 DB와 사용자를 생성하고 권한을 부여
// 모든 이름과 패스워드는 freechart로 통일시키겠습니다.
drop database freechart;
create database freechart;
create user freechart with encrypted password 'freechart';
grant all privileges on database freechart to freechart;

// postgreSQL 연결 종료
\q
```

- 개발 호스트네임 설정

    터미널에서 다음의 명령어를 실행합니다.

```jsx
// vim과 같은 편집기를 이용하여 /etc/hosts 파일에 접근합니다.
sudo vim /etc/hosts

// 다음의 호스트네임을 /etc/hosts 파일에 추가해주세요.
127.0.0.1	freechart.local
```

- 로컬 nginx 서버 설정

    터미널에서 다음의 명령어를 실행합니다.

```jsx
// Homebrew를 이용한 nginx 설치
brew install nginx

// 정상적으로 동작하고 있는지 확인
brew services

// 프로젝트 루트 디렉토리로 이동
// 프로젝트를 다른 경로에 설치했다면, 그 경로에 맞게 이동해주세요.
cd ~/FreeChart

// nginx 로컬 설정 파일 복사
// brew를 사용하지 않는 방식으로 설치된 nginx의 경우, 경로가 다르므로 주의해주세요.
cp ./nginx/freechart.local.conf /usr/local/etc/nginx/servers

// nginx 재시작
brew services reload nginx
```

- 백엔드 api 서버 세팅

    터미널에서 다음의 명령어를 실행합니다.

```jsx
// 먼저 파이썬3와 pip3의 설치 유무를 확인해주세요
// 프로젝트 개발 기준 버전은 다음과 같습니다.
// python 3.7.6
// pip 20.2.2

// 프로젝트 루트 디렉토리로 이동
// 프로젝트를 다른 경로에 설치했다면, 그 경로에 맞게 이동해주세요.
cd ~/FreeChart

// python3 기준 venv라는 이름의 가상환경 생성
python3 -m venv venv

// 가상환경 실행
source venv/bin/activate

// api 서버 애플리케이션의 루트 폴더로 이동
cd back

// 의존성 설치
pip3 install -r requirements.txt

// 데이터베이스 마이그레이션
python3 manage.py migrate

// 만약, 개발을 하면서 ORM 관련하여 모델의 수정이 있을 경우,
// 개발 서버를 잠시 종료한 뒤,
// 다음의 명령어를 실행하여 데이터베이스에 모델의 변경사항을 매번 적용시켜 주세요.
python3 manage.py makemigrations // 새로운 마이그레이션 파일 생성
python3 manage.py migrate // 새로 만든 마이그레이션을 로컬 DB에 적용
```

- SMTP 호스트 설정

    네이버 아이디를 필요로 합니다.

    만약, 사용하려는 네이버 아이디가 2차 로그인 보안이 설정되어 있을 경우 사용하지 못합니다.

    1. 네이버에 로그인 합니다.

    2. 메일로 이동 합니다.

    3. 메일의 메인 화면에서 좌측 하단의 환경설정을 눌러주세요.

    4. 환경설정에서 POP3/IMAP 설정으로 이동해주세요.

    5. IMAP/SMTP 탭으로 이동 후, 사용함으로 체크하고 확인을 눌러주세요.

    6. FreeChart/back/FreeChart/email_setting.py 을 수정합니다.

    ```jsx
    EMAIL_HOST_USER = '아이디@naver.com'
    EMAIL_HOST_PASSWORD = '비밀번호'
    ```

7. 터미널에서 다음의 명령어를 실행합니다.

```jsx
// git에서 변경사항을 무시하도록 설정
// 프로젝트를 다른 경로에 설치했다면, 그 경로에 맞게 바꿔주세요.
git update-index --assume-unchanged ~/FreeChart/back/FreeChart/email_setting.py
```

- 프론트 애플리케이션 설정

    터미널에서 다음의 명령어를 실행합니다.

```jsx
// 먼저 node.js와 yarn의 설치 유무를 확인해주세요
// 프로젝트 개발 기준 버전은 다음과 같습니다.
// node 14.8.0
// yarn 1.22.4

// 프로젝트 루트 디렉토리로 이동
// 프로젝트를 다른 경로에 설치했다면, 그 경로에 맞게 이동해주세요.
cd ~/FreeChart

// 프론트 애플리케이션 폴더로 이동
cd front

// 의존성 설치
yarn
```

<br/>

[목차로 돌아가기](#목차)

## Local 개발 모드 실행 방법

api 서버와 프론트 애플리케이션을 위해 총 2개의 터미널이 필요합니다.

실행 시킨 후에,    [http://freechart.local/](http://freechart.local/)   로 접속할 수 있습니다.

- 확인 사항

    반드시 수행할 필요는 없습니다.

```jsx
// Homebrew를 이용하여 설치가 되었을 때를 가정합니다.
// 만약 다른 방법으로 설치했다면, 경로나 확인 방법이 다를 수 있습니다.

// nginx, postgreSQL, redis가 작동 중인지 확인합니다.
brew services

// nginx 관련 설정을 확인합니다.
cat /etc/hosts
cat /usr/local/etc/nginx/servers/freechart.local.conf

// SECRET KEY와 SMTP 이메일 호스트 설정을 확인합니다.
cd ~/FreeChart/back/FreeChart
cat email_setting.py
cat secret_key.py

// 백엔드 api 서버의 마이그레이션을 확인합니다.
cd ~/FreeChart
source venv/bin/activate
cd back
python3 manage.py migrate
```

- api 서버 실행

    터미널에서 다음의 명령어를 실행합니다.

```jsx
// 프로젝트 루트
cd ~/FreeChart

// 가상환경 진입
source venv/bin/activate

// 백엔드 루트로 이동
cd back

// 실행
python3 manage.py runserver
```

- 프론트 애플리케이션 실행

    터미널에서 다음의 명령어를 실행합니다.

```jsx
// 프론트 애플리케이션 루트로 이동
cd ~/FreeChart/front

// 프론트 개발 모드 실행
yarn start
```

