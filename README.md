JAJOM
=====

Just Another JavaScript OOP Module

Designed to work as a stopgap for actual ES6 classes

```javascript
// Two versions available: The nicer, ES5+ version (used by default),
// and an uglier but more compatible version designed for older browsers.
var Jajom = require('jajom/browser') // The compatible version
var Jajom = require('jajom')  // The default version

// Creating classes is easy:
var Foo = Jajom.Class.extend({
  
  constructor: function () {
    // As with es6 classes, you CANNOT define properties in a 
    // class' prototype. Only functions are allowed. Instead,
    // define instance properties in the constructor.
    this.foo = 'foo'
  },

  getFoo: function () {
    return this.foo
  }

})

// Inheritance is also straight-forward:
var SubFoo = Foo.extend({
  
  constructor: function () {
    // Call the parent method with '_super'
    this._super()
    this.bar = 'bar'
  },

  getFoo: function () {
    return this._super() + 'bar'
  },

  getBar: function () {
    return this.bar
  }

})

// Finally, you can cast objects into Jajom classes
// with `Jajom.create`.
var Backbone = require('backbone')

var JajomedView = Jajom.create(Backbone.View) // You can now use '_super' methods in Backbone Views!

// That's all!
```