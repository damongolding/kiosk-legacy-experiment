# Kiosk legecy experiment

Just a quick experiement using jQuery to grab assets from Kiosk's `/asset/new` endpoint.

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

1. Clone the repository

```sh
git clone https://github.com/damongolding/kiosk-legacy-experiment.git
```

2. CD into the repository

```sh
cd kiosk-legacy-experiment
```

3. Copy and edit the `.env.example` file to `.env`

```sh
cp .env.example .env
nano .env
```

4. Build and run the docker image

```sh
docker compose up -d
```


## Supported URL queries:

In theory all source (album, person, tag, date etc) and metadata queries should be supported but here is a list of ones I have tested:

- duration
- album
- show_image_qr
- show_owner
