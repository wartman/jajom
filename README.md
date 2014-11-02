JAJOM
=====

Just Another JavaScript OOP Module

```javascript
var jajom = require('jajom');

// use jajom to cast any function or object into a jajom.Object
var Test = jajom({
  foo: 'foo'
});

// jajom can take any constructor and its prototype and turn
// them into jajom.Objects.
var Proto = function (n) {
  this.n = n
};
Proto.prototype.getN = function () {
  return this.n
};
var JajomProto = jajom(Proto);
var JajomProtoSub = JajomProto.extend({
  getN: function() {
    return this.sup() + 'extended';
  }
});

// Alternately, extend the jajom.Object directly.
var Foo = jajom.Object.extend(function (foo) {
  // Pass a function to `extend` to define this class'
  // constructor.
  this.foo = foo;
}).methods({
  // Objects passed here will define this class'
  // prototype.
  setFoo: function (foo) {
    this.foo = foo;
  },
  getFoo: function () {
    return this.foo;
  }
}).staticMethods({
  // Add class methods
  fooitize: function (str) {
    str = str + 'foo';
    return this.create(str);
  }
});

// Create an instance the usual way:
var foo = new Foo('bar');
// ... or use create...
var foo = Foo.create('bar');
// ... which is handy if you need to apply some arguments
// to a constructor.
var foo = Foo.create.apply(Foo, ['bar']);

// Inheritance works too!
var Bar = Foo.extend({
  // You can define methods inside `extend` if you'd like:
  // just pass an object-literal. You can still define a 
  // constructor by including in the object, like below:
  constructor: function () {
    // `this.sup()` is a call to this method's parent
    // (it's short for 'super').
    this.sup();
    this.foo = this.foo + 'bar';
  },
  getFoo: function () {
    return 'bar' + this.sup();
  }
}, {
  // The second argument passed the `extend` can be used to add 
  // static methods
  baritize: function (str) {
    return this.create(str);
  }
});
```