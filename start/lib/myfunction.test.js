const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const Module = require('module');

// Mock missing dependencies before requiring myfunction.js
const originalRequire = Module.prototype.require;
Module.prototype.require = function (name) {
    if (name === '@whiskeysockets/baileys') {
        return {
            proto: {},
            delay: () => {},
            getContentType: () => {},
            areJidsSameUser: () => {},
            generateWAMessage: () => {}
        };
    }
    if (name === 'chalk') {
        return {
            redBright: (t) => t,
            green: (t) => t,
            blue: (t) => t
        };
    }
    if (name === 'axios') {
        return {
            get: () => Promise.resolve({ data: {}, headers: {} }),
            default: () => Promise.resolve({ data: {}, headers: {} })
        };
    }
    if (name === 'moment-timezone') {
        const m = () => ({
            locale: () => ({ format: () => '' }),
            tz: () => ({ locale: () => ({ format: () => '' }) }),
            duration: () => ({ asSeconds: () => 0 })
        });
        m.tz = () => ({ locale: () => ({ format: () => '' }) });
        m.duration = () => ({ asSeconds: () => 0 });
        return m;
    }
    if (name === 'human-readable') {
        return {
            sizeFormatter: () => (n) => n
        };
    }
    if (name === 'jimp') {
        return {
            read: () => Promise.resolve({
                getWidth: () => 100,
                getHeight: () => 100,
                crop: function() { return this; },
                scaleToFit: function() { return this; },
                getBufferAsync: () => Promise.resolve(Buffer.from([]))
            }),
            MIME_JPEG: 'image/jpeg'
        };
    }
    return originalRequire.apply(this, arguments);
};

// To prevent the test from hanging due to fs.watchFile in myfunction.js
const myfunctionPath = path.resolve(__dirname, 'myfunction.js');
const myfunction = require('./myfunction.js');
fs.unwatchFile(myfunctionPath);

// Restore original require
Module.prototype.require = originalRequire;

test('bytesToSize', async (t) => {
    await t.test('returns "0 Bytes" for 0', () => {
        assert.strictEqual(myfunction.bytesToSize(0), '0 Bytes');
    });

    await t.test('converts Bytes correctly', () => {
        assert.strictEqual(myfunction.bytesToSize(512), '512 Bytes');
    });

    await t.test('converts KB correctly', () => {
        assert.strictEqual(myfunction.bytesToSize(1024), '1 KB');
        assert.strictEqual(myfunction.bytesToSize(1536), '1.5 KB');
    });

    await t.test('converts MB correctly', () => {
        assert.strictEqual(myfunction.bytesToSize(1024 * 1024), '1 MB');
        assert.strictEqual(myfunction.bytesToSize(1.25 * 1024 * 1024), '1.25 MB');
    });

    await t.test('converts GB correctly', () => {
        assert.strictEqual(myfunction.bytesToSize(Math.pow(1024, 3)), '1 GB');
    });

    await t.test('handles custom decimal places', () => {
        assert.strictEqual(myfunction.bytesToSize(1536, 0), '2 KB');
        assert.strictEqual(myfunction.bytesToSize(1536, 1), '1.5 KB');
        assert.strictEqual(myfunction.bytesToSize(1.23456 * 1024 * 1024, 3), '1.235 MB');
    });

    await t.test('handles negative decimal places by treating them as 0', () => {
        assert.strictEqual(myfunction.bytesToSize(1536, -1), '2 KB');
    });
});
