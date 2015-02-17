!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
}('Jajom', this, function () {

  // Jajom
  // =====
  // The main name-space
  var Jajom = {}

  // Helpers/Shims
  // -------------

  // Use Object.create or a simple shim.
  var create = (Object.create || (function () {
    function Object() {}
    return function (prototype) {
      Object.prototype = prototype
      var result = new Object()
      Object.prototype = null
      return result
    }
  })())

  // Use Object.getPrototypeOf or a simple shim.
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

  // The super implementation.
  var superMethod = function superMethod() {
    var impl = superMethod.caller // Yep, will be depreciated in es6
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

  // Jajom.Property
  // --------------
  // Allows for property definitions.
  Jajom.Property = function (definition) {
    if ('object' !== typeof definition) 
      definition = {value: definition}
    return function property(value, options) {
      if (arguments.length) 
        _setProperty(definition, value, options)
      else
        return definition.value
    }
  }

  // Simple type checker.
  var _typeCheck = function (obj, type) {
    var actual = Object.prototype.toString.call(obj)
    if (actual !== '[object ' + type + ']') {
      throw new Error('Expected ' + type + ', found ' +  actual )
    }
  }

  // Set the property's value. If `this.definition.type` is
  // set, this will check the type and throw an error if there
  // is a mismatch. If `{ignoreType: true}` is set in `options`,
  // then this check will be ignored. Further, if
  // `this.definition.immutiable` is true, the property will
  // not be changed.
  var _setProperty = function (definition, value, options) {
    if (definition.immutiable)
      throw new Error('Cannot change an immutiable property')
    if (definition.type) {
      options || (options = {})
      if (!options.ignoreType) {
        switch (definition.type.toLowerCase()) {
          case 'string': 
            _typeCheck(value, 'String')
            break
          case 'number':
            _typeCheck(value, 'Number')
            break
          case 'boolean':
            _typeCheck(value, 'Boolean')
            break
          case 'object':
            _typeCheck(value, 'Object')
            break
          default:
            throw new Error('Unrecognized type: ' + definition.type)
        }
      }
    }
    definition.value = value
  }

  // Jajom.Class
  // -----------
  // Designed for node environments or browsers that are <ES5 complaint.
  //
  // Based heavily on (but with more compatibility):
  //     http://blog.salsify.com/engineering/super-methods-in-javascript
  //
  Jajom.Class = function () {
    // noop
  }

  // Extend a class.
  Jajom.Class.extend = function extend(source) {
    source || (source = {})
    var parent = this
    var SubClass = (source.hasOwnProperty('constructor'))
      ? source.constructor 
      : function Class() { // Named for prettier console logging
        parent.apply(this, arguments)
      }
    SubClass.prototype = create(parent.prototype)
    for (var key in source) {
      if (key === '_super' || key === 'super') continue
      if ('function' !== typeof source[key]) {
        console.log(typeof source[key])
        throw new Error('Class.extend() Error: Only functions should be '
          + 'present in class prototypes (this is to mimic es6 classes). '
          + 'Use Jajom.Property() or Object.defineProperty() for class properties.')
      }
      if (source.hasOwnProperty(key)) {
        SubClass.prototype[key] = source[key]
        SubClass.prototype[key].__methodName = key
      }
    }
    SubClass.prototype['super'] = 
      SubClass.prototype._super = superMethod
    SubClass.prototype.constructor = SubClass
    SubClass.extend = extend
    return SubClass
  }

  // Jajom.create
  // ------------
  // `Jajom.create` can be used to cast objects into Jajom classes, or as an alternative
  // way to do inheritance.
  //    // For example, here is a way of turning a Backbone View into a Jajom class:
  //    var View = Jajom.create(Backbone.View)
  Jajom.create = function (parent, source) {
    var Sub = Jajom.Class.extend(parent.prototype)
    if (source) Sub = Sub.extend(source)
    return Sub
  }

  // Export Jajom
  return Jajom

})
