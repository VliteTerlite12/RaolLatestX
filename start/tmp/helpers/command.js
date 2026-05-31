const fs = require('fs')
const _cmdUser = JSON.parse(fs.readFileSync('./start/lib/database/commandUser.json'));

async function addCountCmdUser(nama, sender, u) {
    let posi = u.findIndex(i => i.jid === sender);
    if (posi === -1) {
        u.push({ jid: sender, db: [{ nama: nama, count: 0 }] });
        fs.writeFileSync('./start/lib/database/commandUser.json', JSON.stringify(u, null, 2));
        posi = u.length - 1;
    }

    let pos = u[posi].db.findIndex(i => i.nama === nama);
    if (pos === -1) {
        u[posi].db.push({ nama: nama, count: 1 });
        fs.writeFileSync('./start/lib/database/commandUser.json', JSON.stringify(u, null, 2));
    } else {
        u[posi].db[pos].count += 1;
        fs.writeFileSync('./start/lib/database/commandUser.json', JSON.stringify(u, null, 2));
    }
}

async function getPosiCmdUser(sender, _db) {
    const res = _db.findIndex(i => i.jid === sender);
    return res === -1 ? null : res;
}

async function addCountCmd(nama, sender, _db) {
    addCountCmdUser(nama, sender, _cmdUser);
    let posi = _db.findIndex(i => i.nama === nama);
    if (posi === -1) {
        _db.push({ nama: nama, count: 1 });
        fs.writeFileSync('./start/lib/database/command.json', JSON.stringify(_db, null, 2));
    } else {
        _db[posi].count += 1;
        fs.writeFileSync('./start/lib/database/command.json', JSON.stringify(_db, null, 2));
    }
}

module.exports = { addCountCmd, getPosiCmdUser, addCountCmdUser }
