# Test type conversions

# POST markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`# Hello World`

HTTP/1.1 201
[Captures]
md_id: jsonpath "$.fragment.id"

# Convert markdown to HTML
GET http://localhost:8080/v1/fragments/{{md_id}}.html
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
header "Content-Type" contains "text/html"
body contains "<h1>Hello World</h1>"

# Convert markdown to txt
GET http://localhost:8080/v1/fragments/{{md_id}}.txt
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
header "Content-Type" contains "text/plain"

# Convert markdown to md (same type)
GET http://localhost:8080/v1/fragments/{{md_id}}.md
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
header "Content-Type" contains "text/markdown"

# POST CSV fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/csv
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`{"name": "Aung"}`
HTTP/1.1 201
[Captures]
csv_id: jsonpath "$.fragment.id"

# Convert CSV to JSON
GET http://localhost:8080/v1/fragments/{{csv_id}}.json
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
header "Content-Type" contains "application/json"

# Convert CSV to txt
GET http://localhost:8080/v1/fragments/{{csv_id}}.txt
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
header "Content-Type" contains "text/plain"

# POST JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`{"name": "Aung"}`

HTTP/1.1 201
[Captures]
json_id: jsonpath "$.fragment.id"

# Convert JSON to txt
GET http://localhost:8080/v1/fragments/{{json_id}}.txt
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
header "Content-Type" contains "text/plain"

# Convert JSON to json (same type)
GET http://localhost:8080/v1/fragments/{{json_id}}.json
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
header "Content-Type" contains "application/json"

# Unsupported conversion - should 415
GET http://localhost:8080/v1/fragments/{{json_id}}.html
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 415

# Unknown extension - should 415
GET http://localhost:8080/v1/fragments/{{json_id}}.xyz
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 415
