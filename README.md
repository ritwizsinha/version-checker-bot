# version-checker

> A GitHub App built with [Probot](https://github.com/probot/probot) that Checks the version of pom.xml in the pr and in the main repo

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t version-checker .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> version-checker
```

## Contributing

If you have suggestions for how version-checker could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2021 ritwizsinha <ritwizsinha0@gmail.com>
