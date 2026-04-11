# GET /fragments/:id
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`hello world`

HTTP/1.1 201
[Captures]
url: header "Location"
fragment_id: jsonpath "$.fragment.id"

# GET the fragment by id
GET {{url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
[Asserts]
body == "hello world"

# GET non-existent fragment - should 404
GET http://localhost:8080/v1/fragments/does-not-exist
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 404
