!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
}('Jajom', this, function () {

  // Jajom.Class
  // -----------
  // A version of Jajom's class designed for use with browsers.
  // More complex and a bit magic in places, but highly compatible
  // with older browsers.

  // Use Object.create or a simple shim.
  var create = (Object.create || (function () {
    function Object() {}
    return function (prototype) {
      Object.prototype = prototype
      var result = new Object()
      Object.prototype = null
      return result
    }
  }))

  // Define a method, wrapping it for calls to its super if needed.
  function method(obj, key, method) {
    var _super = obj[key]
    if (_super && 'function' === typeof method
        // Check to make sure we don't create circular dependencies.
        && (!_super.valueOf || _super.valueOf() != method.valueOf())
        && /\b_super\b/.test(method)) {
      // Ensure we're using the underlying function (if `method` was already wrapped)
      var originalMethod = method.valueOf()
      // Override the method
      method = function () {
        var prev = this._super || function () {}
        var result
        this._super = _super
        try {
          result = originalMethod.apply(this, arguments)
        } finally {
          this._super = prev
        }
        return result
      }
      method.valueOf = function (type) {
        return (type = 'object')? method : originalMethod
      }
      method.toString = function () {
        return String(originalMethod)
      }
    }
    obj[key] = method
  }

  // Extend an object.
  function mixin(dest, source) {
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        if (key === 'constructor') continue
        if ('function' !== typeof source[key]) {
          throw new Error('Class.extend() Error: Only functions should be '
            + 'present in class prototypes (this is to mimic es6 classes)')
        }
        method(dest, key, source[key])
      }
    }
    return dest
  }

  // The base class
  var Class = function () {}

  // Extend and create a new class from the current one.
  Class.extend = function extend(source) {
    source = source || {}
    // Alias the constructor
    if (source.hasOwnProperty('constructor')) {
      var __constructor = source.constructor
      source.__constructor = __constructor
      delete source.constructor
    }
    var parent = this
    var SubClass = function Class() { // Named for prettier console logging
      this._super = function () {} // Default super method
      if (Class.prototype.__constructor) Class.prototype.__constructor.apply(this, arguments)
    }
    SubClass.prototype = create(parent.prototype)
    mixin(SubClass.prototype, source)
    SubClass.prototype.constructor = SubClass
    SubClass.extend = extend
    // A more useful toString method
    SubClass.toString = function () {
      return (this.prototype.__constructor)? this.prototype.__constructor.toString() : '[object Class]'
    }
    SubClass.valueOf = function () {
      return (this.prototype.__constructor)? this.prototype.__constructor.valueOf() : Object.valueOf()
    }
    return SubClass
  }

  // `Jajom.create` can be used to cast objects into Jajom classes, or as an alternative
  // way to do inheritance.
  //    // For example, here is a way of turning a Backbone View into a Jajom class:
  //    var View = Jajom.create(Backbone.View)
  var jajomCreate = function (parent, source) {
    parent.prototype.__constructor = parent // Ensure `_super` will work as expected.
    return Class.extend.call(parent, source)
  }

  return {
    Class: Class,
    create: jajomCreate
  }

})
