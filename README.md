# Cryptonets-CoreAPI

This code base contains the bare backbone of the cryptonets-api server.

## Environment Pre-Requisites

These environment variables are being used for calling APIs on the backend server

- Port on which the node server will listen

`SERVER_PORT=8888`

- API Key for communicating with the backend server provided by Private Identity

`API_KEY=api_key`

- Server URL for communicating with the backend server provided by Private Identity

`PI_SERVER_1FA=server_url`

This code base is written with the assumption that these variables are available in the `.env` file

`node`, `npm` and `yarn` are assumed to be installed for running the server code.

##  Getting Started

- Install the required node module packages with the following command

`yarn install` or `npm run install`

- To start the node server

`yarn start` or `npm run start`