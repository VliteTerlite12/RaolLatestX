const test = require('node:test');
const assert = require('node:assert');
const { LowSync } = require('./LowSync.js');
const { MissingAdapterError } = require('./MissingAdapterError.js');

test('LowSync constructor', () => {
    assert.throws(() => new LowSync(), MissingAdapterError);

    const adapter = { read: () => {}, write: () => {} };
    const db = new LowSync(adapter);
    assert.strictEqual(db.adapter, adapter);
    assert.strictEqual(db.data, null);
});

test('LowSync.read()', () => {
    const data = { foo: 'bar' };
    const adapter = {
        read: () => data,
        write: () => {}
    };
    const db = new LowSync(adapter);
    db.read();
    assert.deepStrictEqual(db.data, data);
});

test('LowSync.write()', () => {
    let writtenData = null;
    const adapter = {
        read: () => null,
        write: (data) => { writtenData = data; }
    };
    const db = new LowSync(adapter);

    // Should not call write if data is null
    db.write();
    assert.strictEqual(writtenData, null);

    db.data = { bar: 'baz' };
    db.write();
    assert.deepStrictEqual(writtenData, { bar: 'baz' });
});

test('LowSync.write() with falsy data', () => {
    let writtenData = 'not null';
    const adapter = {
        read: () => null,
        write: (data) => { writtenData = data; }
    };
    const db = new LowSync(adapter);

    // In LowSync.js: if (this.data !== null) { this.adapter.write(this.data); }
    // This means if this.data is 0, it WILL be written.
    db.data = 0;
    db.write();
    assert.strictEqual(writtenData, 0);
});
