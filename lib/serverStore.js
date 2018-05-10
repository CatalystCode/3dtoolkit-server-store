const async = require('async'),
    DocumentClient = require('documentdb').DocumentClient,
    HttpStatusCodes = require('http-status-codes');

const DEFAULT_COLLECTION_NAME = 'servers',
    DEFAULT_DATABASE_NAME = '3dtoolkit',
    DEFAULT_COLLECTION_RU = 1000;

function checkOptionExists(options, optionName, callback) {
    if (!options[optionName]) {
        return callback(new Error(`${optionName} option not provided.`));
    }
}

class ServerStore {
    createDatabase(callback) {
        this.cosmosDbClient.readDatabase(this.databaseUrl, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOT_FOUND) {
                    this.cosmosDbClient.createDatabase(
                        { id: this.databaseName },
                        (err, created) => {
                            return callback(err);
                        }
                    );
                } else {
                    return callback(err);
                }
            } else {
                return callback();
            }
        });
    }

    createCollection(callback) {
        this.cosmosDbClient.readCollection(
            this.collectionUrl,
            (err, result) => {
                if (err) {
                    if (err.code == HttpStatusCodes.NOT_FOUND) {
                        this.cosmosDbClient.createCollection(
                            this.databaseUrl,
                            { id: this.collectionName },
                            {
                                offerThroughput: this.collectionRUs
                            },
                            (err, created) => {
                                return callback(err);
                            }
                        );
                    } else {
                        return callback(err);
                    }
                } else {
                    return callback();
                }
            }
        );
    }

    init(options, callback) {
        checkOptionExists(options, 'cosmosDbEndpoint', callback);
        checkOptionExists(options, 'cosmosDbKey', callback);

        this.databaseName = options.databaseName || DEFAULT_DATABASE_NAME;
        this.collectionName = options.collectionName || DEFAULT_COLLECTION_NAME;
        this.collectionRUs = options.collectionRUs || DEFAULT_COLLECTION_RU;

        this.cosmosDbClient = new DocumentClient(options.cosmosDbEndpoint, {
            masterKey: options.cosmosDbKey
        });

        this.databaseUrl = `dbs/${this.databaseName}`;
        this.collectionUrl = `${this.databaseUrl}/colls/${this.collectionName}`;

        return callback();
    }

    getAll(callback) {
        let query = `SELECT * FROM ${this.collectionName} a`;

        this.cosmosDbClient
            .queryDocuments(this.collectionUrl, query)
            .toArray(callback);
    }

    getByServerId(serverId, callback) {
        let query = `SELECT * FROM ${
            this.collectionName
        } a WHERE a.serverId = "${serverId}"`;

        this.cosmosDbClient
            .queryDocuments(this.collectionUrl, query)
            .toArray(callback);
    }

    delete(serverId, callback) {
        let documentUrl = `${this.collectionUrl}/docs/${serverId}`;
        this.cosmosDbClient.deleteDocument(documentUrl, err => {
            if (err && err.code !== HttpStatusCodes.NOT_FOUND) {
                return callback(err);
            }

            return callback();
        });
    }

    upsert(server, callback) {
        server.id = server.serverId;
        let documentUrl = `${this.collectionUrl}/docs/${server.id}`;

        this.cosmosDbClient.replaceDocument(documentUrl, server, err => {
            if (!err || (err && err.code !== HttpStatusCodes.NOT_FOUND))
                return callback(err);

            this.cosmosDbClient.createDocument(
                this.collectionUrl,
                server,
                callback
            );
        });
    }
}

module.exports = ServerStore;
