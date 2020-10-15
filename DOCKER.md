[돌아가기](https://github.com/LEEJ0NGWAN/FreeChart#개발자-문서)

## Docker 관련 사항

<img src="/README/docker.png">

- 구성

    Docker-compose에는 다음과 같은 서비스들을 컨테이너로써 실행합니다.

    - psql

        데이터베이스 컨테이너

    - front

        정적인 프론트 애플리케이션을 빌드하는 컨테이너

    - back

        api 서버 컨테이너

    - nginx

        프론트 앱을 탑재하고, api 서버로 프록시 패스를 수행하는 컨테이너

    - redis

        인증코드를 관리하는 key-value 데이터베이스 컨테이너

- 볼륨
    - freechart_front_app

        front 서비스와 nginx 서비스가 공유하는 볼륨입니다.

        정적인 프론트 앱 빌드가 이 볼륨을 통해 nginx로 전달됩니다.

        최초로 접근하는 컨테이너에 한해서만 업데이트 되는 볼륨의 특성 때문에,

        프론트 애플리케이션의 업데이트가 있을 때 마다, 볼륨을 제거하고 이미지 리빌드가 필요합니다.

    - freechart_psql_data

        DB 서비스가 데이터를 저장하는 볼륨입니다.

