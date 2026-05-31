const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const Module = require('module');

/**
 * NOTE: This project environment sometimes lacks certain dependencies (like 'ms')
 * in the node_modules. Conventionally, we mock these by hooking Module.prototype.require
 * or injecting into require.cache to allow modules to load for unit testing.
 * This is isolated to this test execution process.
 */
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
    if (id === 'ms') {
        return (val) => {
            if (typeof val === 'number') return val;
            return 1000;
        };
    }
    return originalRequire.apply(this, arguments);
};

// Mock fs.readFileSync to avoid dependency on the actual database file during module load.
// This prevents modifying the source tree or relying on existing data files.
const originalReadFileSync = fs.readFileSync;
test.mock.method(fs, 'readFileSync', function(path) {
    if (typeof path === 'string' && path.includes('userPremium.json')) {
        return '[]';
    }
    return originalReadFileSync.apply(this, arguments);
});

// Mock fs.writeFileSync to prevent any accidental writes during tests.
test.mock.method(fs, 'writeFileSync', () => {});

const { checkPremiumUser } = require('./premium.js');

test('checkPremiumUser - user exists in directory (array)', (t) => {
    const dir = [
        { id: 'user1', expired: 123456789 },
        { id: 'user2', expired: 987654321 }
    ];
    const result = checkPremiumUser('user1', dir);
    assert.strictEqual(result, true);
});

test('checkPremiumUser - user exists in directory (object)', (t) => {
    const dir = {
        'key1': { id: 'user1', expired: 123456789 },
        'key2': { id: 'user2', expired: 987654321 }
    };
    const result = checkPremiumUser('user2', dir);
    assert.strictEqual(result, true);
});

test('checkPremiumUser - user does not exist in directory', (t) => {
    const dir = [
        { id: 'user1', expired: 123456789 },
        { id: 'user2', expired: 987654321 }
    ];
    const result = checkPremiumUser('user3', dir);
    assert.strictEqual(result, false);
});

test('checkPremiumUser - empty directory (array)', (t) => {
    const dir = [];
    const result = checkPremiumUser('user1', dir);
    assert.strictEqual(result, false);
});

test('checkPremiumUser - empty directory (object)', (t) => {
    const dir = {};
    const result = checkPremiumUser('user1', dir);
    assert.strictEqual(result, false);
});

test('checkPremiumUser - matches correctly among multiple users', (t) => {
    const dir = [
        { id: 'user1', expired: 123456789 },
        { id: 'user2', expired: 987654321 },
        { id: 'user3', expired: 111222333 }
    ];
    const result = checkPremiumUser('user2', dir);
    assert.strictEqual(result, true);
});

test('checkPremiumUser - handles null/undefined directory (expected to throw)', (t) => {
    assert.throws(() => {
        checkPremiumUser('user1', null);
    }, TypeError);
    assert.throws(() => {
        checkPremiumUser('user1', undefined);
    }, TypeError);
});
