const assert = require('assert'),
    ServerStore = require('../../lib/serverStore'),
    fixtures = require('../fixtures');

let serverStore;

describe('serverStore data store', function() {
    beforeEach(done => {
        serverStore = new ServerStore();

        let options = {
            cosmosDbEndpoint: process.env.ACTIVE_CONNECTIONS_COSMOSDB_ENDPOINT,
            cosmosDbKey: process.env.ACTIVE_CONNECTIONS_COSMOSDB_KEY,
            databaseName: process.env.ACTIVE_CONNECTIONS_DATABASE_NAME,
            collectionName: process.env.ACTIVE_CONNECTIONS_COLLECTION_NAME
        };

        serverStore.init(options, err => {
            assert(!err);

            serverStore.delete(fixtures.server.serverId, done);
        });
    });

    it('can create a database', done => {
        serverStore.createDatabase(err => {
            assert(!err);

            done();
        });
    });

    it('can create a collection', done => {
        serverStore.createCollection(err => {
            assert(!err);

            done();
        });
    });

    it('can insert and get by server id', done => {
        serverStore.upsert(fixtures.server, err => {
            assert(!err);

            serverStore.getByServerId(
                fixtures.server.serverId,
                (err, servers) => {
                    assert(!err);
                    assert.equal(servers.length, 1);
                    assert.equal(servers[0].serverId, fixtures.server.serverId);
                    done();
                }
            );
        });
    });

    it('can delete a server', done => {
        serverStore.upsert(fixtures.server, err => {
            assert(!err);

            serverStore.delete(fixtures.server.serverId, err => {
                assert(!err);

                serverStore.getByServerId(
                    fixtures.server.serverId,
                    (err, servers) => {
                        assert(!err);
                        assert.equal(servers.length, 0);

                        done();
                    }
                );
            });
        });
    });
});
