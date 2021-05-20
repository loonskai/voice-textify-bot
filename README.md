## `.env`
```
BOT_TOKEN=<TELEGRAM_BOT_TOKEN>
SUBSCRIPTION_KEY=<MICROSOFT_ASURE_SUBSCRIPTION_KEY>
```

## Development
```
docker-compose up --build
```

## Production
```
docker build --tag=voice-textify --target=prod .
docker run -d --env-file=.env voice-textify:latest
```
