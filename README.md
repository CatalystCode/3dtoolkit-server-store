# server-store

A module used by the orchestration service of the [3dtoolkit](https://github.com/CatalystCode/3dtoolkit) to managed the shared state around active vms handing webrtc servers.

## Installation

```
$ npm install --save 3dtoolkit-server-store
```

## Initialization

The module exposes a class, ServerStore. Instances of this class requires initialization to setup the database client via the init method with the options below. Only cosmosDbEndpoint and cosmosDbKey are required, the others, if not provided, will default to the values below.

```
let serverStore = new ServerStore();

let options = {
    cosmosDbEndpoint: <CosmosDB endpoint>,
    cosmosDbKey: <CosmosDB key>,
    databaseName: <Database Name>, // defaults to '3dtoolkit'
    collectionName: <Collection Name>, // defaults to 'servers'
    collectionRUs: <# of request units to provision for collection> // defaults to 1000
};

serverStore.init(options, err => {

    // ... perform actions on serverStore per below

});
```

## serverStore.upsert(server, callback)

You can upsert servers into the store via 'upsert'. If a server exists it will be updated, otherwise it will be inserted.

```
// server is of the form { serverId: "...", azureServerId: "...", turnServerId: "..." }
serverStore.upsert(server, err => {
    // server has been upserted.
});
```

## serverStore.delete(serverId, callback)

Deletes a server from the store.

```
serverStore.delete(serverId, err => {
    // server has been deleted.
}
```

## getByServerId(serverId, callback)

Gets a server's entry by server id.

```
serverStore.getByServerId((err, servers => {
    // servers is an array of server entries
})
```

More usage details can be found in the unit tests.
