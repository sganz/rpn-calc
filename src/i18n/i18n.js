// Load Module and Instantiate the i18 stuff

var i18nConfig = {
  // change the cookie name from 'lang' to 'locale'
  cookieName: 'locale',

  // indent defaults to tab, lets make it 4 spaces
  indent: '    ',

  // set all others to this, not really needed see below
  defaultLocal: 'en',

  // setup some locales - other locales default to the first locale
  locales: ['en', 'de', 'es'],

  // force the devmode which will cause writing to language files
  // as it encounters new strings via __()
  devmode: false, // true will cause updated to language files
};

var i18n = new (require('i18n-2'))(i18nConfig);

module.exports = i18n;
module.exports.i18nConfig = i18nConfig;
