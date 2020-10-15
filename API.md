[돌아가기](https://github.com/LEEJ0NGWAN/FreeChart#개발자-문서)

## api

api 서버 호스트를 생략하고, 하위 경로만 기술합니다.

예를 들어, `/account/login/`는 `http://api서버/account/login/` 을 나타냅니다.

POST와 PUT 메소드는 통상적으로 json 데이터 형식을 이용합니다. (예외 별도 표시)

리퀘스트에서 등장하는 물음표 `?` 는 해당 파라매터가 필수 요소가 아님을 나타내기 위해 사용됩니다.

- [계정 api](#1.-계정-관련-api)  

- [사용자 api](#2.-사용자-관련-api)  

- [보드 api](#3.-보드-관련-api)  

- [쉬트 api](#4.-쉬트-관련-api)  

- [보드, 쉬트 관련 기타 api](#5.-보드,-쉬트-관련-기타-api)  

- [원소 api](#6.-원소-api)  


## 1. 계정 관련 api

### [GET] /accounts/

email의 사용 가능 여부를 체크하는 api

- request

```jsx
{
	email
}
```

- response [성공]: 200

```jsx
{
	// true: 사용가능, false: 사용불가
	email:boolean
}
```

- response [실패]: 400

```jsx
{}
```

### [POST] /accounts/

로그인 api

- request

```jsx
{
	email,
	password
}
```

- response [성공]: 200

```jsx
{
	refresh,	// JWT 갱신 토큰
	access,		// JWT 인증 토큰
	user: {
		id,
		email,
		username
	}
}
```

- response [실패]: 400

```jsx
// 리퀘스트 데이터가 잘못된 경우
{
	error
}
```

- response [실패]: 404

```jsx
// 사용자가 존재하지 않을 경우
{
	error
}
```

### [POST] /accounts/email

계정 인증 api

데이터 없이 리퀘스트를 보내면 인증 메일을 전송합니다.

토큰과 이메일을 전달하면, 해당 이메일의 인증을 수행합니다.

- request

```jsx
{
	token?,		// email과 같이 전달되어야 합니다.
	email?		// token과 같이 전달되어야 합니다.
}
```

- response [성공]: 200

```jsx
{}
```

- response [실패]: 400

```jsx
// 리퀘스트 데이터가 잘못된 경우
{
	error
}
```

- response [실패]: 404

```jsx
// 해당 이메일의 사용자가 없거나 토큰이 redis에 없는 경우(시간 만료)
{
	error
}
```

### [POST] /accounts/password

비밀번호 초기화 api

데이터 없이 리퀘스트를 보내면 비밀번호 초기화 메일을 전송합니다.

토큰과 이메일을 전달하면, 계정 비밀번호 초기화를 수행합니다.

- request

```jsx
{
	token?,  // email과 같이 전달되어야 합니다.
	email?   // token과 같이 전달되어야 합니다.
}
```

- response [성공]: 200

```jsx
// 비밀번호 초기화 메일 전송을 성공한 경우
{}
```

- response [성공]: 302  (JSON response가 아닙니다!)

```jsx
// 메일에서 비밀번호 초기화 버튼을 누른 경우
// 메인 페이지로 리디렉션됩니다.
```

- response [실패]: 400

```jsx
// 리퀘스트 데이터가 잘못된 경우
{
	error
}
```

- response [실패]: 404

```jsx
// 해당 이메일의 사용자가 없거나 토큰이 redis에 없는 경우(시간 만료)
{
	error
}
```

### [PUT] /accounts/password

현재 유저의 비밀번호를 확인하는 api

- request

```jsx
{
	id,	// 현재 유저의 id
	password
}
```

- response [성공]: 200

```jsx
{}
```

- response [실패]: 400

```jsx
// 리퀘스트 데이터가 잘못되거나, 유저 id의 불일치, 패스워드 불일치의 경우
{
	error
}
```

### [POST] /accounts/token

jwt 토큰 인증 기간 재갱신 api

- request

```jsx
{
	refresh  // JWT 갱신 토큰
}
```

- response [성공]: 200

```jsx
{}
```

- response [실패]: 401

```jsx
// jwt 인증 실패의 경우
{}
```

## 2. 사용자 관련 api

### [GET] /users

사용자 조회 api

- request

```jsx
{
	id?	// 사용자의 아이디를 전달하면 해당 id의 사용자를 조회합니다.
}
```

- response [성공]: 200

```jsx
{
	user: {
		id,
		email,
		username
	}
}
```

- response [실패]: 401

```jsx
// jwt 인증 실패의 경우
{}
```

- response [실패]: 404

```jsx
// 전달받은 사용자 id에 해당하는 사용자가 없는 경우
{}
```

### [POST] /users

신규 사용자 생성 api

- request

```jsx
{
	email,
	password,
	username?	// username이 전달되지 않으면, 사용자의 닉네임은 이메일이 됩니다.
}
```

- response [성공]: 200

```jsx
{
	refresh,	// JWT 갱신 토큰
	access,		// JWT 인증 토큰
	user: {
		id,
		email,
		username
	}
}
```

- response [실패]: 400

```jsx
// 리퀘스트 데이터가 잘못된 경우
{
	error
}
```

- response [실패]: 409

```jsx
// 해당 이메일로 등록된 사용자가 이미 있는 경우
{
	error
}
```

### [PUT] /users

사용자 정보 수정 api

닉네임과 비밀번호를 변경하는 api 입니다.

- request

```jsx
{
	username?	// 새로운 닉네임
	password?	// 새로운 비밀번호
}
```

- response [성공]: 200

```jsx
{
	user: {
		id,
		email,
		username
	}
}
```

- response [실패]: 401

```jsx
// jwt 인증 실패의 경우
{}
```

### [DELETE] /users

사용자(본인) 정보 삭제 api

- request

```jsx
{}
```

- response [성공]: 200

```jsx
{}
```

- response [실패]: 401

```jsx
// jwt 인증 실패의 경우
{}
```

## 3. 보드 관련 api

### [GET] /boards

현재 사용자의 보드(폴더) 조회 api

다음과 같은 3가지 기능을 제공합니다.

- 특정 보드의 조회                           (id 파라매터)
- 특정 보드에 포함된 보드들 조회   (parent_id 파라매터)
- 현재 사용자의 모든 보드 조회       (파라매터 없음)
- request

```jsx
{
	id?		// 특정 보드를 조회하고 싶을 때 전달
	parent_id?	// 특정 보드에 포함된 보드들을 조회하고 싶을 때 전달
  	order?		// 조회될 보드들의 정렬순서입니다. (기본값: 수정일짜 내림차순)
}
```

사용 가능한 order 패러매터의 값은 다음과 같습니다. (마이너스 부호는 내림차순을 의미)

`-modify_date`  `-create_date`  `-title`  `modify_date`  `create_date`  `title`

- response [성공]: 200 (특정 보드를 조회)

```jsx
{
	board: {
		id,
		title,
		parent_id,	// 가장 바깥에 존재하는 보드는 이 값이 null입니다.
		create_date,
		modify_date
	}
}
```

- response [성공]: 200 (특정 보드에 포함된 보드들을 조회)

```jsx
{
	boards: [
		{
			id,
			title,
			parent_id,	// 요청했던 특정 보드의 id값이 됩니다.
			create_date,
			modify_date
		},
		...
	]
}
```

- response [성공]: 200 (현재 사용자의 모든 보드를 조회)

```jsx
{
	boards: [
		{
			id,
			title,
			parent_id,
			create_date,
			modify_date
		},
		...
	]
}
```

- response [실패]: 401

```jsx
// jwt 인증 실패의 경우
{}
```

- response [실패]: 404

```jsx
// 전달받은 id에 해당하는 보드가 없을 경우
{}
```

### [POST] /boards

보드 생성 api

- request

```jsx
{
	title,		// 만들고 싶은 보드의 제목
	parent_id?	// 부모로 삼을 특정 보드의 id
}
```

- response [성공]: 200

```jsx
{
	board: {
		id,
		title,
		parent_id,	// 가장 바깥에 존재하는 보드는 이 값이 null입니다.
		create_date,
		modify_date
	}
}
```

- response [실패]: 400

```jsx
// 리퀘스트 데이터가 잘못된 경우
{}
```

- response [실패]: 401

```jsx
// jwt 인증 실패의 경우
{}
```

### [PUT] /boards

보드 수정 api

- request

```jsx
{
	id,		// 수정할 보드의 id
	title?,		// 새로 적용할 제목
	parent_id?		// 새로 적용할 상위 보드의 id
}
```

- response [성공]: 200

```jsx
{
	board: {
		id,
		title,
		parent_id,	// 가장 바깥에 존재하는 보드는 이 값이 null입니다.
		create_date,
		modify_date
	}
}
```

- response [실패]: 400

```jsx
// 리퀘스트 데이터가 잘못된 경우 (보드의 id가 없는 경우)
{}
```

- response [실패]: 401

```jsx
// jwt 인증 실패의 경우
{}
```

- response [실패]: 404

```jsx
// 전달받은 id에 해당되는 보드가 없는 경우
{}
```

### [DELETE] /boards

보드 삭제 api

- request

```jsx
{
	id,			// 삭제 할 보드의 id
	save_child?: boolean	// 삭제 할 보드에 포함되었던 자식(보드,쉬트)의 삭제 방지 여부
				// (기본값: false <- 같이 삭제)
}
```

- response [성공]: 200 (자식도 같이 삭제했을 경우)

```jsx
{
  // 삭제된 보드의 정보
	board: {
		id,
		title,
		parent_id,
		create_date,
		modify_date
	}
}
```

- response [성공]: 200 (자식은 삭제하지 않은 경우)

```jsx
{
  // 삭제된 보드의 정보
	parent: {
		id,
		title,
		parent_id,
		create_date,
		modify_date
	},
  // 복구한 자식들의 정보
	boards: [
		{
			id,
			title,
			parent_id,	// 삭제된 보드의 부모, 즉, 조부모로 연결됩니다.
			create_date,
			modify_date
		},
		...
	],
	sheets: [
		{
			id,
			title,
			board_id,	// 삭제된 보드의 부모, 즉, 조부모로 연결됩니다.
			create_date,
			modify_date
		},
		...
	]
}
```

- response [실패]: 400

```jsx
// 리퀘스트 데이터가 잘못된 경우 (보드의 id가 없는 경우)
{}
```

- response [실패]: 401

```jsx
// jwt 인증 실패의 경우
{}
```

- response [실패]: 404

```jsx
// 전달받은 id에 해당되는 보드가 없는 경우
{}
```

## 4. 쉬트 관련 api

### [GET] /sheets

현재 사용자의 쉬트(네트워크 그래프) 조회 api

다음과 같은 3가지 기능을 제공합니다.

- 특정 쉬트의 조회                           (id 파라매터)
- 특정 보드에 포함된 쉬트들 조회   (board_id 파라매터)
- 현재 사용자의 모든 쉬트 조회       (파라매터 없음)
- request

```jsx
{
	id?		// 특정 보드를 조회하고 싶을 때 전달
	board_id?	// 특정 보드에 포함된 보드들을 조회하고 싶을 때 전달
	order?		// 조회할 쉬트들의 정렬순서입니다. (기본값: 수정일짜 내림차순)
}
```

사용 가능한 order 패러매터의 값은 다음과 같습니다. (마이너스 부호는 내림차순을 의미)

`-modify_date`  `-create_date`  `-title`  `modify_date`  `create_date`  `title`

- response [성공]: 200 (특정 쉬트를 조회)

```jsx
{
	sheet: {
		id,
		title,
		board_id,	// 가장 바깥에 존재하는 쉬트는 이 값이 null입니다.
		create_date,
		modify_date
	}
}
```

- response [성공]: 200 (특정 보드에 포함된 쉬트들을 조회)

```jsx
{
	sheets: [
		{
			id,
			title,
			board_id,	// 요청했던 특정 보드의 id값이 됩니다.
			create_date,
			modify_date
		},
		...
	]
}
```

- response [성공]: 200 (현재 사용자의 모든 쉬트를 조회)

```jsx
{
	sheets: [
		{
			id,
			title,
			board_id,
			create_date,
			modify_date
		},
		...
	]
}
```

- response [실패]: 401

```jsx
// jwt 인증 실패의 경우
{}
```

- response [실패]: 404

```jsx
// 전달받은 id에 해당하는 보드가 없을 경우
{}
```

### [POST] /sheets

쉬트 생성 api

- request

```jsx
{
	title,		// 만들고 싶은 쉬트의 제목
	board_id?	// 부모로 삼을 특정 보드의 id
}
```

- response [성공]: 200

```jsx
{
	sheet: {
		id,
		title,
		board_id,	// 가장 바깥에 존재하는 쉬트는 이 값이 null입니다.
		create_date,
		modify_date
	}
}
```

- response [실패]: 400

```jsx
// 리퀘스트 데이터가 잘못된 경우
{}
```

- response [실패]: 401

```jsx
// jwt 인증 실패의 경우
{}
```

### [PUT] /sheets

쉬트 수정 api

- request

```jsx
{
	id,		// 수정할 쉬트의 id
	title?,		// 새로 적용할 제목
	board_id?	// 새로 적용할 상위 보드의 id
}
```

- response [성공]: 200

```jsx
{
	sheet: {
		id,
		title,
		board_id,	// 가장 바깥에 존재하는 쉬트는 이 값이 null입니다.
		create_date,
		modify_date
	}
}
```

- response [실패]: 400

```jsx
// 리퀘스트 데이터가 잘못된 경우 (쉬트의 id가 없는 경우)
{}
```

- response [실패]: 401

```jsx
// jwt 인증 실패의 경우
{}
```

- response [실패]: 404

```jsx
// 전달받은 id에 해당되는 쉬트가 없는 경우
{}
```

### [DELETE] /sheets

보드 삭제 api

- request

```jsx
{
	id	// 삭제 할 쉬트의 id
}
```

- response [성공]: 200

```jsx
{
  // 삭제된 쉬트의 정보
	sheet: {
		id,
		title,
		board_id,
		create_date,
		modify_date
	}
}
```

- response [실패]: 400

```jsx
// 리퀘스트 데이터가 잘못된 경우 (쉬트의 id가 없는 경우)
{}
```

- response [실패]: 401

```jsx
// jwt 인증 실패의 경우
{}
```

- response [실패]: 404

```jsx
// 전달받은 id에 해당되는 쉬트가 없는 경우
{}
```

### [POST] /sheets/copies

특정 쉬트를 복제하는 api

- request

```jsx
{
	sheet_id	// 복제할 쉬트의 id
}
```

- response [성공]: 200

```jsx
{}
```

- response [실패]: 400

```jsx
// 리퀘스트 데이터가 잘못된 경우 (쉬트의 id가 없는 경우)
{}
```

- response [실패]: 401

```jsx
// jwt 인증 실패의 경우
{}
```

- response [실패]: 404

```jsx
// 전달받은 id에 해당되는 쉬트가 없는 경우
{}
```

## 5. 보드, 쉬트 관련 기타 api

### [GET] /children

기준 위치에 포함된 보드와 쉬트를 가져오는 api

- request

```jsx
{
	id?,	// 기준이 될 보드의 id (기본값: null)
		// null의 경우, 가장 바깥(root)에 위치한 보드와 쉬트를 가져옵니다.

	order?	// 조회될 자식들의 정렬순서입니다. (기본값: 수정일짜 내림차순)
}
```

사용 가능한 order 패러매터의 값은 다음과 같습니다. (마이너스 부호는 내림차순을 의미)

`-modify_date`  `-create_date`  `-title`  `modify_date`  `create_date`  `title`

- response [성공]: 200

```jsx
{
  // 기준 위치에 해당되는 보드 (null의 경우, 빈 객체가 반환됩니다.)
	parent: {
		id,
		title,
		parent_id,
		create_date,
		modify_date
	},
  // 자식들의 정보
	boards: [
		{
			id,
			title,
			parent_id,
			create_date,
			modify_date
		},
		...
	],
	sheets: [
		{
			id,
			title,
			board_id,
			create_date,
			modify_date
		},
		...
	]
}
```

- response [실패]: 401

```jsx
// jwt 인증 실패의 경우
{}
```

- response [실패]: 404

```jsx
// 전달받은 id에 해당되는 보드가 없는 경우
{}
```

### [GET] /sheets/test/elements

체험하기 용도의 테스트 데이터를 가져오는 api

- request

```jsx
{}
```

- response [성공]: 200

```jsx
{
	// 테스트 네트워크를 구성하는 노드와 엣지의 정보
	nodes: [
		{
			id,
			label,		// 노드가 표시하는 텍스트
			x,		// 노드의 좌표 값
			x_,
			y,
			y_,
			font: int,	// 노드의 글자 크기
			shape,		// 노드의 모양
			color		// 노드의 색
		},
		...
	],
	edges: [
		{
			id,
			label,			// 엣지가 표시하는 텍스트
			from,			// 엣지의 시작점 노드 id
			to,			// 엣지의 끝점 노드 id
			dashes: boolean,	// 엣지의 점선 여부
			width:  int,		// 엣지의 굵기
			arrow:  boolean,	// 엣지의 끝 부분의 화살표 여부
			arrows: {
				to: {
					type,			// 화살표가 있을 경우 유형 (arrow, image)
					scaleFactor: int	// 화살표가 있을 경우 크기
				}
			}
		},
		...
	]
}
```

## 6. 원소 api

### [GET] /sheets/elements

특정 쉬트(네트워크 그래프)를 구성하는 원소(노드, 엣지)의 데이터를 가져오는 api

- request

```jsx
{
	sheet_id
}
```

- response [성공]: 200

```jsx
{
	// 네트워크를 구성하는 노드와 엣지의 정보
	nodes: [
		{
			id,
			label,		// 노드가 표시하는 텍스트
			x,		// 노드의 좌표 값
			x_,
			y,
			y_,
			font: int,	// 노드의 글자 크기
			shape,		// 노드의 모양
			color		// 노드의 색
		},
		...
	],
	edges: [
		{
			id,
			label,			// 엣지가 표시하는 텍스트
			from,			// 엣지의 시작점 노드 id
			to,			// 엣지의 끝점 노드 id
			dashes: boolean,	// 엣지의 점선 여부
			width:  int,		// 엣지의 굵기
			arrow:  boolean,	// 엣지의 끝 부분의 화살표 여부
			arrows: {
				to: {
					type,			// 화살표가 있을 경우 유형 (arrow, image)
					scaleFactor: int	// 화살표가 있을 경우 크기
				}
			}
		},
		...
	]
}
```

- response [실패]: 400

```jsx
// 리퀘스트 데이터가 잘못된 경우 (쉬트의 id가 없는 경우)
{}
```

- response [실패]: 401

```jsx
// jwt 인증 실패의 경우
{}
```

- response [실패]: 404

```jsx
// 전달받은 id에 해당되는 쉬트가 없는 경우
{}
```

### [PUT] /sheets/elements

특정 쉬트(네트워크 그래프)를 구성하는 원소(노드, 엣지)의 데이터를 조작하는 api

- request

```jsx
{
	sheet_id,
	// 변경된 원소들의 최신 정보(가장 마지막 형태)를 담은 JSON 배열
	nodes: [
		{
			id,
			label,		// 노드가 표시하는 텍스트
			x,		// 노드의 좌표 값
			x_,
			y,
			y_,
			font: int,	// 노드의 글자 크기
			shape,		// 노드의 모양
			color		// 노드의 색
		},
		...
	],
	edges: [
		{
			id,
			label,			// 엣지가 표시하는 텍스트
			from,			// 엣지의 시작점 노드 id
			to,			// 엣지의 끝점 노드 id
			dashes: boolean,	// 엣지의 점선 여부
			width:  int,		// 엣지의 굵기
			arrow:  boolean,	// 엣지의 끝 부분의 화살표 여부
			arrows: {
				to: {
					type,			// 화살표가 있을 경우 유형
					scaleFactor: int	// 화살표가 있을 경우 크기
				}
			}
		},
		...
	],
	nodeStates: {
		node1_id: 0,
		node2_id: 1,
		node3_id: 2,
		...
	},
	edgeStates: {
		edge1_id: 0,
		edge2_id: 1,
		edge3_id: 2,
		...
	}
}
```

nodes와 edges 파라매터는 각각 변경한 원소들의 최신 정보(가장 마지막 모습)를 나타냅니다.

nodeStates와 edgeStates 파라매터는 각각 변경한 원소들이 어떤 식으로 변경되었는지를 나타냅니다.

변경된 원소들을 key로 하고, 해당 원소의 변경 모드를 value로 가집니다.

변경 모드는 `0:삭제` `1:생성` `2:수정` 으로 구성되며 각 모드를 나타내는 숫자(0, 1, 2)를 value로 표현합니다.

- response [성공]: 200

```jsx
{}
```

- response [실패]: 400

```jsx
// 리퀘스트 데이터가 잘못된 경우
{}
```

- response [실패]: 401

```jsx
// jwt 인증 실패의 경우
{}
```

- response [실패]: 404

```jsx
// 전달받은 sheet_id에 해당되는 쉬트가 없는 경우
{}
```

