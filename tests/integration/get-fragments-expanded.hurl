# GET /fragments?expand=1
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`test fragment`

HTTP/1.1 201
[Captures]
fragment_id: jsonpath "$.fragment.id"

# GET expanded list
GET http://localhost:8080/v1/fragments?expand=1
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" isCollection
jsonpath "$.fragments[0].id" isString
jsonpath "$.fragments[0].type" isString
jsonpath "$.fragments[0].size" isInteger
