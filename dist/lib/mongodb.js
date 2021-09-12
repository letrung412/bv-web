"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoCommon = exports.FromMongoData = exports.ToMongoData = exports.MongoError = exports.MongoDB = void 0;
const mongodb_1 = require("mongodb");
var mongodb_2 = require("mongodb");
Object.defineProperty(exports, "MongoDB", { enumerable: true, get: function () { return mongodb_2.Db; } });
Object.defineProperty(exports, "MongoError", { enumerable: true, get: function () { return mongodb_2.MongoError; } });
function RenameOne(doc, from, to) {
    if (!doc) {
        return null;
    }
    const obj = {};
    for (const [k, v] of Object.entries(doc)) {
        if (k === from) {
            obj[to] = v;
        }
        else {
            obj[k] = v;
        }
    }
    return obj;
}
function RenameArray(docs, from, to) {
    if (!docs) {
        return [];
    }
    const res = [];
    for (const d of docs) {
        res.push(RenameOne(d, from, to));
    }
    return res;
}
exports.ToMongoData = {
    Many(docs) {
        return RenameArray(docs, 'id', '_id');
    },
    One(doc) {
        return RenameOne(doc, 'id', '_id');
    }
};
exports.FromMongoData = {
    Many(docs) {
        return RenameArray(docs, '_id', 'id');
    },
    One(doc) {
        return RenameOne(doc, '_id', 'id');
    }
};
async function checkReplicaSet(client) {
    const adminDb = client.db('admin');
    try {
        const info = await adminDb.executeDbAdminCommand({ replSetGetStatus: 1 });
        const members = info.members.map(m => m.name);
        console.log(`mongodb replica set [${info.set}] members [${members.join(',')}]`);
        return false;
    }
    catch (err) {
        if (err.codeName === 'NoReplicationEnabled') {
            console.log(`mongodb replica set not enabled, check mongod.cfg for (replication: replSetName: "rs0")`);
            throw new Error('mongodb replica set not enabled');
        }
        else if (err.codeName === 'NotYetInitialized') {
            console.log('mongodb has no replica set, initiating a new one');
            await adminDb.executeDbAdminCommand({
                replSetInitiate: 1
            });
            return true;
        }
        else {
            throw err;
        }
    }
}
async function Connect(url, opts = {}) {
    const client = new mongodb_1.MongoClient(url, {
        useUnifiedTopology: true
    });
    await client.connect();
    if (!opts.replica) {
        return client;
    }
    const newSetCreated = await checkReplicaSet(client);
    if (newSetCreated) {
        console.log('mongodb replica set initiated, wait for 10 seconds');
        await new Promise(r => setTimeout(r, 10000));
    }
    return client;
}
const sessionSymbol = Symbol('session');
exports.MongoCommon = {
    Connect,
    WithSession(ctx, session) {
        ctx[sessionSymbol] = session;
        return ctx;
    },
    Session(ctx) {
        return ctx[sessionSymbol];
    }
};
