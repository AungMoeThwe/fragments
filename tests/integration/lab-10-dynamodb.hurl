# POST a new JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
test-user1@fragments-testing.com:test-password1
{ "service": "DynamoDB" }

HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/json"
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# GET the fragment info for the first fragment
GET {{fragment1_url}}/info
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment1_id}}
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 25

# POST a second Markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`DynamoDB is **great**.`

HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/markdown"
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# GET the fragment info for the second fragment
GET {{fragment2_url}}/info
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment2_id}}
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 22

# GET all fragments for the user (IDs only)
GET http://localhost:8080/v1/fragments
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" contains {{fragment1_id}}
jsonpath "$.fragments" contains {{fragment2_id}}

# DELETE the first fragment
DELETE {{fragment1_url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

# Try to GET the first fragment - should return 404
GET {{fragment1_url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 404

# GET all fragments again - first should be gone, second should still be there
GET http://localhost:8080/v1/fragments
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" not contains {{fragment1_id}}
jsonpath "$.fragments" contains {{fragment2_id}}
