const test = require('node:test');
const assert = require('node:assert');
const Module = require('module');
const fs = require('fs');

// Mock fs.watchFile to prevent it from hanging or causing side effects
const originalWatchFile = fs.watchFile;
fs.watchFile = () => {};

// Safer mocking approach: only monkey-patch during the require of the target module
const originalRequire = Module.prototype.require;
Module.prototype.require = function(path) {
    try {
        return originalRequire.apply(this, arguments);
    } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            if (path === '@whiskeysockets/baileys') {
                return {
                    proto: { WebMessageInfo: { fromObject: () => ({}), toObject: () => ({}) } },
                    delay: () => {},
                    getContentType: () => {},
                    areJidsSameUser: () => {},
                    generateWAMessage: () => {}
                };
            }
            if (path === 'chalk') {
                return {
                    redBright: (t) => t,
                    green: (t) => t,
                    yellow: (t) => t,
                    blue: (t) => t,
                    magenta: (t) => t,
                    cyan: (t) => t,
                    white: (t) => t,
                    gray: (t) => t
                };
            }
            if (path === 'axios') {
                return {
                    get: () => Promise.resolve({ data: {}, headers: {} }),
                    default: () => Promise.resolve({ data: {}, headers: {} })
                };
            }
            if (path === 'moment-timezone') {
                const moment = () => ({
                    locale: () => ({ format: () => '' }),
                    tz: () => ({ locale: () => ({ format: () => '' }) }),
                    format: () => '',
                    duration: () => ({ asSeconds: () => 0 })
                });
                moment.tz = () => ({ locale: () => ({ format: () => '' }) });
                moment.duration = () => ({ asSeconds: () => 0 });
                return moment;
            }
            if (path === 'human-readable') {
                return { sizeFormatter: () => (bytes) => `${bytes} B` };
            }
            if (path === 'jimp') {
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
        }
        throw err;
    }
};

const { getGroupAdmins } = require('./myfunction');

// Restore original require and watchFile immediately after loading the module
Module.prototype.require = originalRequire;
fs.watchFile = originalWatchFile;

test('getGroupAdmins', async (t) => {
    await t.test('should return admins and superadmins', () => {
        const participants = [
            { id: 'user1@s.whatsapp.net', admin: 'admin' },
            { id: 'user2@s.whatsapp.net', admin: 'superadmin' },
            { id: 'user3@s.whatsapp.net', admin: null }
        ];
        const result = getGroupAdmins(participants);
        assert.deepStrictEqual(result, ['user1@s.whatsapp.net', 'user2@s.whatsapp.net']);
    });

    await t.test('should return an empty array if no admins are present', () => {
        const participants = [
            { id: 'user1@s.whatsapp.net', admin: null },
            { id: 'user2@s.whatsapp.net', admin: 'member' }
        ];
        const result = getGroupAdmins(participants);
        assert.deepStrictEqual(result, []);
    });

    await t.test('should return an empty array for an empty participants list', () => {
        const participants = [];
        const result = getGroupAdmins(participants);
        assert.deepStrictEqual(result, []);
    });

    await t.test('should throw an error when participants is null', () => {
        assert.throws(() => {
            getGroupAdmins(null);
        }, TypeError);
    });

    await t.test('should throw an error when participants is undefined', () => {
        assert.throws(() => {
            getGroupAdmins(undefined);
        }, TypeError);
    });
});
