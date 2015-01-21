// If you need to be sure about compatibility, use this file.
// Typically, if you're planning on creating something for 
// the web, do:
//
//    var Jajom = require('jajom/browser')
//
// rather then:
//
//    var Jajom = require('jajom')
//
// If you're not using browserify/whatever, you can find a minified
// version of `jajom/src/class-browser` in `jajom/dist/jajom.min.js`,
// which will work with AMD or as a global var just fine.
module.exports = require('./src/class-browser')
