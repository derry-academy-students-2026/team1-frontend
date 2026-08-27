environment = "dev"
location    = "uksouth"

# Must resolve from inside the Container App environment. Internal ingress on a
# backend in a different environment is not reachable.
api_base_url = "http://localhost:4000"

feature_registration_enabled = true
