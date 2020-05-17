const request = require('request'),
    SteamCommunity = require('steamcommunity'),
    SteamTotp = require('steam-totp'),
    TradeOfferManager = require('./steam-tradeoffer-manager'),
    fs = require('fs'),
    steam = new SteamCommunity(),
    config = require('./config.json');

var manager = new TradeOfferManager({
    "domain": config.domain,
    "language": "en",
    "pollInterval": 2000
});

const logOnOptions = {
    "accountName": config.accountName,
    "password":  config.password,
    "twoFactorCode": SteamTotp.getAuthCode(config.sharedSecret)
};

if (fs.existsSync('steamguard_e.txt')) {
    logOnOptions.steamguard = fs.readFileSync('steamguard_e.txt').toString('utf8');
}

if (fs.existsSync('polldata_e.json')) {
    manager.pollData = JSON.parse(fs.readFileSync('polldata_e.json'));
}

steam.login(logOnOptions, function (err, sessionID, cookies, steamguard) {
    if (err) {
        console.log("Steam login fail: " + err.message);
    }
    fs.writeFile('steamguard_e.txt', steamguard, (err) => {
        if (err) throw err;
    });
    console.log("Logged into Steam");
    manager.setCookies(cookies, function (err) {
        if (err) {
            console.log(err);
            return;
        }
    });
});

manager.on('scamOffer', function (offer) {
    console.log(offer);
    if(TradeOfferManager.ETradeOfferState[offer.state] === 'Canceled') {
        console.log('User account probably compromised');
    }
    // offer.decline();
});

