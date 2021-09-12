# Server

## Presequisites
- NodeJS >= v14.16.1
- MongoDB >= 4.4 with replica set. See bellow.

## Install
- `npm install`

## Configuration
- Copy `.env.example` to `.env`
- Open `.env`, set `DB_URL`

## Development
- `npm start;`

## Guide

### Setup MongoDB Replica Set
Reference: https://docs.mongodb.com/manual/administration/replica-set-deployment/
Create `mongod.cfg` file in the same folder with `mongod`
Put the following content into the config file
```yaml
replication:
   replSetName: "rs0"
```
Restart mongod


# bv-web
