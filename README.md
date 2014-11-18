JAJOM
=====

Just Another JavaScript OOP Module

```javascript
var jajom = require('jajom')

// use jajom to cast any function or object into a jajom.Object
var Test = jajom({
  foo: 'foo'
})

// jajom can take any constructor and its prototype and turn
// them into jajom.Objects.
var Proto = function (n) {
  this.n = n
}
Proto.prototype.getN = function () {
  return this.n
}
var JajomProto = jajom(Proto)
var JajomProtoSub = JajomProto.extend({
  getN: function() {
    return this.sup() + 'extended'
  }
})

// Alternately, extend the jajom.Object directly.
var Foo = jajom.Object.extend({
  // Pass methods here to extend the object
  constructor: function (foo) {
    this.foo = foo
  },
  someMethod: function () {
    console.log('Hello, world')
  }
}).methods({
  // You can also use `methods` to add more prototype
  // methods to a defined class.
  setFoo: function (foo) {
    this.foo = foo
  },
  getFoo: function () {
    return this.foo
  }
}).staticMethods({
  // Add class methods
  fooitize: function (str) {
    str = str + 'foo'
    return this.create(str)
  }
})

// Create an instance the usual way:
var foo = new Foo('bar')
// ... or use create...
var foo = Foo.create('bar')
// ... which is handy if you need to apply some arguments
// to a constructor.
var foo = Foo.create.apply(Foo, ['bar'])

// Inheritance works too!
var Bar = Foo.extend(function () {
  // You can pass a function instead of an object-literal to 'extend' if you'd like.
  // All methods bound to 'this' will be used as methods, and you can
  // use closures to define 'private' methods
  var _aPrivateThing = 'hi'
  this.constructor = function () {
    // `this.sup()` is a call to this method's parent
    // (it's short for 'super').
    this.sup()
    this.foo = this.foo + 'bar' + _aPrivateThing
  }
  this.getFoo = function () {
    return 'bar' + this.sup()
  }
}, {
  // The second argument passed the `extend` can be used to add 
  // static methods
  baritize: function (str) {
    return this.create(str)
  }
})
```