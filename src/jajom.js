(function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
})('jajom', this, function () {

  // Helpers
  // -------

  // Wrap a method for super calls.
  var testSuper = /\bsup\b/
  function wrap(method, parentMethod) {
    if ((parentMethod && 'function' == typeof method)
        // Check to make sure we don't create circular dependencies.
        && (!parentMethod.valueOf || parentMethod.valueOf() != method.valueOf())
        && testSuper.test(method)) {
      // Ensure we're using the underlying function (if `method` was already wrapped)
      var originalMethod = method.valueOf()
      // Override the method
      method = function () {
        var prev = this.sup || jajom.Object.prototype.sup
        var result
        this.sup = parentMethod
        try {
          result = originalMethod.apply(this, arguments)
        } finally {
          this.sup = prev
        }
        return result
      }
      // Make valueOf and toString return the unwrapped functions,
      // which is a lot more useful for debugging / etc.
      method.valueOf = function (type) {
        return (type = 'object')? method : originalMethod
      }
      method.toString = jajom.Object.toString
    }
    return method
  }

  // Mixin an object.
  function mixin(obj, src, options) {
    options = options || {}
    for (var key in src) {
      if (src.hasOwnProperty(key)) {
        if (options.noWrap) {
          obj[key] = src[key]
        } else {
          var parentProp = obj[key]
          obj[key] = wrap(src[key], parentProp)
        }
      }
    }
  }

  // jajom
  // -----  
  // Pass any function or object to `jajom`, and it will
  // be transformed into a `jajom.Object`.
  function jajom(obj) {
    if ('object' === typeof obj) return jajom.Object.extend(obj)
    return jajom.Object.extend(obj)
      .methods(obj.prototype, jajom.Object.prototype)
      .statics(obj, jajom.Object)
  }

  // jajom.Object
  // ------------
  // The core object all classes inherit from.
  jajom.Object = function () {
    // Dummy
  }

  // Extend the base object and create a new class.
  jajom.Object.extend = function (props, staticProps) {
    var parent = this
    var extended, constructor, Sub

    props = props || {}
    staticProps = staticProps || {}

    // If the first argument is a function, use it as
    // the constructor.
    if ('function' === typeof props) props = {constructor: props}

    jajom.__prototyping = true
    // Inherit prototype from the parent.
    extended = new parent()
    // Mixin new prototype props.
    mixin(extended, props)
    delete jajom.__prototyping

    // Create the constructor
    constructor = extended.constructor
    Sub = extended.constructor = function () {
      if (!jajom.__prototyping) return constructor.apply(this, arguments)
    }

    // Inherit static props from the parent (without wrapping functions).
    mixin(Sub, parent, {noWrap: true})
    Sub.valueOf = function (type) {
      return (type == "object") ? Sub : constructor
    }
    // Add in static props
    mixin(Sub, staticProps)
    // Add proto props.
    Sub.prototype = extended

    return Sub
  }

  // Mixin methods to the prototype.
  jajom.Object.methods = function () {
    for (var i = 0; i < arguments.length; i += 1) {
      mixin(this.prototype, arguments[i])
    }
    return this
  }

  // Mixin methods to a class ('statics') or an instance ('implement').
  jajom.Object.statics = jajom.Object.prototype.implement = function () {
    for (var i = 0; i < arguments.length; i += 1) {
      mixin(this, arguments[i])
    }
    return this
  }

  // Default 'sup' function.
  jajom.Object.sup = jajom.Object.prototype.sup = function () {
    throw new Error('No super method to call')
  }

  // An alternate way to create classes, handy if you need
  // to apply arguments to a new instance.
  jajom.Object.create = function () {
    var constructor = this.prototype.constructor
    var args = arguments
    function Surrogate() {
      return constructor.apply(this, args)
    }
    Surrogate.prototype = constructor.prototype
    return new Surrogate()
  }

  jajom.Object.valueOf = function (){
    return '[jajom.Object]'
  }

  jajom.Object.toString = function () {
    return String(this.valueOf())
  }

  // Ensure the correct constructor is set.
  jajom.Object.prototype.constructor = jajom.Object

  // jajom.Singleton
  // ---------------
  // A special class designed to allow for the creation of
  // singletons.
  jajom.Singleton = jajom.Object.extend().statics({

    getInstance: function () {
      if (!this._instance) this.setInstance()
      return this._instance
    },

    setInstance: function () {
      this._instance = this.create.apply(this, arguments)
    }

  })

  return jajom

});
