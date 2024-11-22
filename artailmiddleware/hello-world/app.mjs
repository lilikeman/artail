const HTTP_METHOD_GET = "GET";
const HTTP_METHOD_POST = "POST";
const HTTP_METHOD_PUT = "PUT";
const HTTP_METHOD_PATCH = "PATCH";
const HTTP_METHOD_DELETE = "DELETE";
export const lambdaHandler = async (event, context) => {

  const { path, httpMethod, queryStringParameters } = event;
  // HTTP 서버 URL (클라이언트 -> 미들웨어 -> HTTP 서버)
  try {
    if (path.startsWith('/users')) {
      // 사용자검색
      if (path === '/users/search' && httpMethod === HTTP_METHOD_GET) {
        const response = await fetch(`http://15.165.170.112:3000/users/search` + `?keyword=${queryStringParameters.keyword}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const responseData = await response.json();
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',  // CORS 설정 추가
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',  // 허용된 HTTP 메서드
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',  // 허용된 헤더
          },
          body: JSON.stringify({
            message: 'Successfully fetched data from HTTP server.',
            data: responseData,
          }),
        };
        // 사용자 삭제
      } else if (path === '/users' && httpMethod === HTTP_METHOD_DELETE) {
        const userId = queryStringParameters.userId;
        console.log("delete invoked");
        console.log("UserId:", userId);

        const response = await fetch(`http://15.165.170.112:3000/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // 응답이 정상적으로 오면
        const responseData = await response.json();

        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',  // CORS 설정
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',  // 허용된 HTTP 메서드
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',  // 허용된 헤더
          },
          body: JSON.stringify({
            message: 'Successfully deleted user.',
            data: responseData,
          }),
        };
      }
      //랭킹조회
    } else if (path.startsWith('/rankings')) {

      const response = await fetch(`http://15.165.170.112:3000/rankings` + `?page=${queryStringParameters.page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',  // CORS 설정 추가
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',  // 허용된 HTTP 메서드
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',  // 허용된 헤더
        },
        body: JSON.stringify({
          message: 'Successfully fetched data from HTTP server.',
          data: responseData,
        }),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'path가 이상해요.'
        }),
      };
    }
  } catch (error) {
    console.log(error);

  }


};