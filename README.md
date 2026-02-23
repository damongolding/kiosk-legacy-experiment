# Kiosk legecy experiment

Just a quick experiement using jQuery to grab assets from Kiosk's `/asset/new` endpoint.

## Prerequisites

If the branch `feature/cors` has not been merged, you will need to pull and use the Kiosk dev build image `ghcr.io/damongolding/immich-kiosk-development:0.33.0-cors`.

Then add the following to your config.yaml file:

```yaml
kiosk:
  allowed_origins:
    - http://localhost:5432 # This is the default port for the development server
    # - http://localhost:4173 # This is the default port for the preview server
```

### Rename and change the env file

```sh
cp example.env .env
```

## Supported URL queries:

In theory all source (album, person, tag, date etc) and metadata queries should be supported but here is a list of ones I have tested:

- duration
- album
- show_image_qr
- show_owner
