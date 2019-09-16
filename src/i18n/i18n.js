// Load Module and Instantiate the i18 stuff

var i18n = new (require('i18n-2'))({
    // indent defaults to tab, lets make it 4 spaces
    indent: '    ',

    // set all others to this, not really needed see below
    defaultLocal:'en',

    // setup some locales - other locales default to the first locale
    locales: ['en', 'de', 'es']
});

module.exports = i18n;