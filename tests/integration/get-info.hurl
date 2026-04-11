# GET /fragments/:id/info
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`{"test": "info"}`

HTTP/1.1 201
[Captures]
fragment_id: jsonpath "$.fragment.id"

# GET fragment info
GET http://localhost:8080/v1/fragments/{{fragment_id}}/info
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment_id}}
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" isInteger

# GET info for non-existent fragment
GET http://localhost:8080/v1/fragments/does-not-exist/info
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 404
