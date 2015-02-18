JAJOM
=====

"Just Another JavaScript OOP Module".

Jajom is designed as a stop-gap for real ES6 classes. It provides the
bare-minimum functionality needed and nothing else.

```javascript

var Class = require('jajom')

// Creating classes is easy, and should be familiar to anyone
// who's used Backbone.
var Foo = Class.extend({

  constructor: function () {
    // `constructor` defines, as you probably have guessed,
    // the object's constructor.
    this.foo = 'foo'
  },

  getFoo: function () {
    return this.foo
  }

})

// Inheritance is also straight-forward:
var SubFoo = Foo.extend({

  constructor: function () {
    // Override a method with '_super'
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

```

That's it!

Acknowledgments
---------------
The code here is based on [this Salsify blog post](http://blog.salsify.com/engineering/super-methods-in-javascript).
The main difference is a bit of work I've done to make Jajom
compatible with older browsers (ie8). You can read up on some of
the drawbacks of this method over on the blog (specifically the
use of `Function#caller`), but I think this is a better interim solution
then the alternative of wrapping every method to re-assign `Class#_super`.
