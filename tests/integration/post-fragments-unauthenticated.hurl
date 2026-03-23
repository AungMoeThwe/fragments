# POST without auth should return 401
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
`This is a fragment!`

HTTP/1.1 401
