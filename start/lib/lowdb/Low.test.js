const test = require('node:test');
const assert = require('node:assert');
const { Low } = require('./Low.js');
const { MissingAdapterError } = require('./MissingAdapterError.js');

test('Low constructor', () => {
    assert.throws(() => new Low(), MissingAdapterError);

    const adapter = { read: () => {}, write: () => {} };
    const db = new Low(adapter);
    assert.strictEqual(db.adapter, adapter);
    assert.strictEqual(db.data, null);
});

test('Low.read()', async () => {
    const data = { foo: 'bar' };
    const adapter = {
        read: async () => data,
        write: async () => {}
    };
    const db = new Low(adapter);
    await db.read();
    assert.deepStrictEqual(db.data, data);
});

test('Low.write()', async () => {
    let writtenData = null;
    const adapter = {
        read: async () => null,
        write: async (data) => { writtenData = data; }
    };
    const db = new Low(adapter);

    // Should not call write if data is null
    await db.write();
    assert.strictEqual(writtenData, null);

    db.data = { bar: 'baz' };
    await db.write();
    assert.deepStrictEqual(writtenData, { bar: 'baz' });
});

test('Low.write() with falsy data', async () => {
    let writtenData = 'not null';
    const adapter = {
        read: async () => null,
        write: async (data) => { writtenData = data; }
    };
    const db = new Low(adapter);

    // In Low.js: if (this.data) { await this.adapter.write(this.data); }
    // This means if this.data is 0, it won't be written.
    db.data = 0;
    await db.write();
    assert.strictEqual(writtenData, 'not null'); // adapter.write not called
});
