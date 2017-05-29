
.PHONY: profile-api-mock
profile-api-mock: profile-api.json
	swagger-codegen generate -i profile-api.json -l nodejs-server -o profile-api-mock
