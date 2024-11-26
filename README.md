  # artail
  본 서비스는 다음의 기능 및 구조를 가집니다.
    구조 : http통신을 기반으로 client <-> middleware <-> server
    기능 : 1)모든 사용자의 랭킹확인 2)키워드(userId 와 닉네임) 검색 3)사용자 삭제

  다음은 client 관련 설명입니다.
    언어 : Dart(flutter)
    환경 : webBrowser 타겟, 플러터 기반 SPA
    라이브러리 : Dio (Flutter) - HTTP 요청을 처리하기 위한 HTTP 클라이언트 라이브러리.
    기타 : 
      1)플러터 기반 SPA는 처음 기동 시 로딩시간이 걸림(앱을 로컬에 다운로드하는 시간) 
      2)메인 페이지는 랭킹조회 페이지입니다.
      3)검색 페이지로 이동은 오른쪽 상단 "돋보기 버튼"을 눌러 이동합니다.
      4)검색 페이지에서 랭킹조회 페이지로 이동은 오른쪽 상단 "순위 버튼"을 눌러 이동합니다.
      5)검색 페이지에서 검색은 키워드를 입력 후 "enter"키를 눌러 또는 textfield 오른쪽 "검색 버튼"을 눌러 검색합니다.
  다음은 middleware 관련 설명입니다.
    언어 : javascript(node 20.x.x)
    환경 : AWS lambda기반 미들웨어
    라이브러리 : N/A 
    기타 :
      1)AWS lambda로 만들어진 미들웨어이기에, cold Start시 반응이 느립니다.
  다음은 server 관련 설명입니다.
    언어 : javascript(node 20.x.x)
    환경 : express기반 모놀리스 서버, AWS lightsail 사용
    라이브러리 : Express, CORS, sqlite3,xlsx
    기타 : N/A

  다음은 응시하는 중 느낌점입니다.
    1) server를 세팅하는 중 http -> https로 설정할떄 개인도메인이 없어서, 미들웨어가 필요해짐
    2) flutter webapp 호스팅 시 netlify를 사용하였는데 간단하게 배포할떄는 강력한 툴이었음
    3) 관계형DB을 사용하는 툴로 sqlite3를 사용하였는데, 서비스할 정도로 퍼포먼스가 확인됨
    4) erd 생성, api작성 에 시험응시 시간을 30%정도 사용하고, 70%는 배포 및 환경설정에 사용함.
