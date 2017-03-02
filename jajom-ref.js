!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
}('Jajom', this, function () {

  // Use Object.create or a simple shim (for < ie8).
  var create = (Object.create || (function () {
    function Object() {}
    return function (prototype) {
      Object.prototype = prototype
      var result = new Object()
      Object.prototype = null
      return result
    }
  })())

  // Use Object.getPrototypeOf or a simple shim (for < ie8).
  getPrototypeOf = (Object.getPrototypeOf || function (obj) {
    var proto = obj.__proto__
    if (proto || proto === null) {
      return proto
    } else if (obj.constructor) {
      return obj.constructor.prototype
    } else {
      return Object.prototype
    }
  })

  // The super implementation. This uses the non-standard `Function#caller`,
  // however all browsers (and node.js) currently support it. This is the
  // reason we do not run this script in strict mode.
  var superMethod = function superMethod() {
    var impl = this._super.caller
    var name = impl.__methodName
    var foundImpl = this[name] === impl
    var args = Array.prototype.slice.call(arguments)
    var proto = this

    // Search through the prototype chain until a matching method is found
    while (proto = getPrototypeOf(proto)) {
      if (!proto[name]) {
        break
      } else if (proto[name] === impl) {
        // If this is the current method, then use the next matching
        // method down the prototype chain.
        foundImpl = true
      } else if (foundImpl) {
        return proto[name].apply(this, args)
      }
    }
    if (!foundImpl) 
      throw new Error("`super` may not be called outside a method implementation")
  }

  // Jajom
  // =====
  // Designed for node environments or browsers.
  //
  // Based heavily on (but with more compatibility):
  //     http://blog.salsify.com/engineering/super-methods-in-javascript
  //
  var Jajom = function () {
    // noop
  }

  // Extend a class.
  Jajom.extend = function extend(source) {
    source || (source = {})
    var parent = this
    var SubClass = (source.hasOwnProperty('constructor'))
      ? source.constructor 
      : function Class() { // Named for prettier console logging
        parent.apply(this, arguments)
      }
    SubClass.prototype = create(parent.prototype)
    for (var key in source) {
      if (source.hasOwnProperty(key)
          && !(key === '_super' || key === 'super')) {
        SubClass.prototype[key] = source[key]
        SubClass.prototype[key].__methodName = key
      }
    }
    SubClass.prototype['super'] = 
      SubClass.prototype._super = superMethod
    SubClass.prototype.constructor = SubClass
    SubClass.extend = Jajom.extend
    return SubClass
  }

  // Export Jajom
  return Jajom

})
