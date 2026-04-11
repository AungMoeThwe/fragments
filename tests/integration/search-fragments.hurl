# Search fragments by type
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`{"search": "test"}`

HTTP/1.1 201

# Search with query - should return expanded results filtered by type
GET http://localhost:8080/v1/fragments?expand=1&query=json
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" isCollection
