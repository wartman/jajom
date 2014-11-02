!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
}('jajom', this, function () {

  // jajom
  // -----  
  // Pass any function or object to `jajom`, and it will
  // be transformed into a `jajom.Object`.
  function jajom(obj) {
    if ('object' === typeof obj) return jajom.Object.extend(obj)
    return jajom.Object.extend(obj)
      .methods(obj.prototype, jajom.Object.prototype)
      .staticMethods(obj, jajom.Object)
  }

  // jajom.Object
  // ------------
  // The core object all classes inherit from.
  jajom.Object = function () {
    // Dummy
  }

  // Extend the base object and create a new class.
  jajom.Object.extend = function (props, staticProps) {
    props = ('function' === typeof props)
      ? {constructor: props} 
      : (props || {})

    // Create the prototype chain
    var parent = this
    jajom.__prototyping = true
    var proto = new parent()
    extend.call(proto, props)
    delete jajom.__prototyping

    // Create the constructor
    var constructor = proto.constructor
    function Class() { // Named function for prettier console logging
      if (!jajom.__prototyping) return constructor.apply(this, arguments)
    }
    proto.constructor = Class;

    // Mixin parent statics and any passed ones.
    extend.call(Class, parent, (staticProps || {}))
    // Set valueOf manually.
    Class.valueOf = function (type) {
      return (type == 'object')? Class : constructor.valueOf()
    }
    // Set the prototype.
    Class.prototype = proto

    return Class
  }

  // Add methods to the prototype.
  jajom.Object.methods = function () {
    extend.apply(this.prototype, arguments)
    return this
  }

  // Add a single method to this class's prototype. Will wrap the class
  // for super calls if needed (the reason you'd use this over `Class.prototype.foo = whatever`).
  jajom.Object.addMethod = function () {
    method.apply(this.prototype, arguments)
    return this
  }

  // Add helper functions for mixins on the class or
  // on the class prototype.
  jajom.Object.staticMethods = extend
  jajom.Object.addStaticMethod = method
  jajom.Object.prototype.implement = extend
  jajom.Object.prototype.addMethod = method

  // An alternate way to create classes, handy if you need
  // to apply arguments to a new instance.
  jajom.Object.create = function () {
    var constructor = this.prototype.constructor
    var args = arguments
    function Class() {
      return constructor.apply(this, args)
    }
    Class.prototype = constructor.prototype
    return new Class()
  }

  jajom.Object.toString = function () {
    return String(this.valueOf())
  }

  // Ensure the correct constructor is set.
  jajom.Object.prototype.constructor = jajom.Object

  // Define a method, wrapping it for calls to its super if needed.
  function method(key, method) {
    var sup = this[key]
    if (sup && 'function' === typeof method
        // Check to make sure we don't create circular dependencies.
        && (!sup.valueOf || sup.valueOf() != method.valueOf())
        && /\bsup\b/.test(method)) {
      // Ensure we're using the underlying function (if `method` was already wrapped)
      var originalMethod = method.valueOf()
      // Override the method
      method = function () {
        var prev = this.sup || function () {}
        var result
        this.sup = sup
        try {
          result = originalMethod.apply(this, arguments)
        } finally {
          this.sup = prev
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
    this[key] = method
    return this
  }

  // Extend an object. Passing more then one `source` will apply them all to 'this'
  function extend(source) {
    if (arguments.length > 1) {
      for (var i = 0; i < arguments.length; i += 1) {
        extend.call(this, arguments[i]);
      }
      return this
    }
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        if (!jajom.__prototyping && key === 'constructor') continue
        method.call(this, key, source[key])
      }
    }
    return this
  }

  return jajom

});
