# cga_notifications

POC web app to demonstrate basic functionality the `cloud.gov.au` team could use to notifiy its users.

[![CircleCI](https://circleci.com/gh/govau/cga_notifications.svg?style=svg)](https://circleci.com/gh/govau/cga_notifications)

## Configuration:
The following environment variables are required to be set when using certain modules:

```bash
# cga_notifications-server
export CF_ENV - Local cloud environment e.g "y"
export CF_TOKEN - Local cloud user token to authenticate with CF api.
export CF_HOST - Local CF hostname e.g "api.system.y.cld.gov.au"

# cga_notifications-email ( Deprecated )
export MAIL_HOST - Mail server hostname e.g "smtp.mailgun.com"
export MAIL_USER - Username use to auth with mail server
export MAIL_PASS - Password use to auth with mail server

# cga_notifications-notify
export NOTIFY_API - notify.gov.au API token
export NOTIFY_BASE - notify.gov.au API endpoint e.g "rest-api.notify.gov.au"

# cga_notifications-github
export GITHUB_TOKEN - api.github.com API token 
```

## Issues:
- Authentication is _currently_ done with `CF_TOKEN`, this is a temporary token generated from `cf oauth-token` after authentication with a local CF environment. This token can be publically viewed and abused.

- Users should be grouped via `org`.



