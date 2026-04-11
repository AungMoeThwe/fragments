# PUT /fragments/:id - update a fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`original content`

HTTP/1.1 201
[Captures]
fragment_id: jsonpath "$.fragment.id"

# Update the fragment using the id directly
PUT http://localhost:8080/v1/fragments/{{fragment_id}}
Content-Type: text/plain
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`updated content`

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"

# GET and verify updated content
GET http://localhost:8080/v1/fragments/{{fragment_id}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
body == "updated content"
