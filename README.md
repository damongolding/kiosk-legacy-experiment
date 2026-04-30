# Kiosk legecy experiment

Just a quick experiement using jQuery to grab assets from Kiosk's `/asset/new` endpoint.

## Browser support
I do not own an old hardware but a user has reported this was working on Safari 9 (IOS 9).

### Custom CSS
As this will probably need some custom CSS to make it work. On launch it will grab the [custom CSS](https://docs.immichkiosk.app/configuration/custom-css/) from the Kiosk server and apply it to the page. The body has an id of `kiosk-legacy`.

Example:
```css
#kiosk-legacy .progress--bar {
    background-color: red;
}
```

## Prerequisites

Add the following to your Kiosk config.yaml file:

```yaml
kiosk:
  allowed_origins:
    - http://YOUR_IP:4000 # If running via the supplied docker compose
```

### Rename and change the env file

```sh
cp example.env .env
```

## Docker installation

1. Use the docer-compose.yaml file
2. Change the `KIOSK_URL` env
3. Run `docker compose up -d`


## Supported URL queries:

In theory all source (album, person, tag, date etc) and metadata queries should be supported but here is a list of ones I have tested:

- duration
- album
- show_image_qr
- show_owner
