# cga_notifications

POC web app to demonstrate basic functionality the `cloud.gov.au` team could use to notifiy its users.

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
export NOTIFY_BASE - notify.gov.au API endpoint 
```

## Issues:
- Authentication is _currently_ done with `CF_TOKEN`, this is a temporary token generated from `cf oauth-token` after authentication with a local CF environment. This token can be publically viewed and abused.

- Users should be grouped via `org`.

- Nodemailer should be swapped for `govau/notifications-api`

- No deployment configuration, basic auth 


