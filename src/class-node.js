!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
}('Jajom', this, function () {

  // Jajom.Class
  // -----------
  // Designed for node environments or browsers that are ES5+ complaint.
  // The idea is for it to be easily replaced with ES6 classes as soon
  // as that is practical.
  //
  // Based heavily on:
  //     http://blog.salsify.com/engineering/super-methods-in-javascript
  var Class = function () {}

  // Extend a class. To mimic es6 classes as much as possible, only
  // functions are allowed in the class prototype, and class-methods
  // must be defined directly on the constructor.
  Class.extend = function extend(source) {
    source || (source = {})
    var parent = this
    var SubClass = (source.hasOwnProperty('constructor'))
      ? source.constructor 
      : function Class() { // Named for prettier console logging
        parent.apply(this, arguments)
      }
    SubClass.prototype = Object.create(parent.prototype)
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        if ('function' !== typeof source[key]) {
          throw new Error('Class.extend() Error: Only functions should be '
            + 'present in class prototypes (this is to mimic es6 classes)')
        }
        SubClass.prototype[key] = source[key]
        SubClass.prototype[key].__methodName = key
      }
    }
    SubClass.prototype.constructor = SubClass
    SubClass.extend = extend
    return SubClass
  }

  // The super implementation.
  var superProperty = {
    get: function get() {
      var impl = get.caller // Yep, will be depreciated in es6
      var name = impl.__methodName
      var foundImpl = this[name] === impl
      var proto = this

      // Search through the prototype chain until a matching method is found
      while (proto = Object.getPrototypeOf(proto)) {
        if (!proto[name]) {
          break
        } else if (proto[name] === impl) {
          // If this is the current method, then use the next matching
          // method down the prototype chain.
          foundImpl = true
        } else if (foundImpl) {
          return proto[name]
        }
      }
      if (!foundImpl) throw "`super` may not be called outside a method implementation"
    }
  }

  // Super methods.
  Object.defineProperties(Class.prototype, {
    'super': superProperty,
    '_super': superProperty
  })

  // `Jajom.create` can be used to cast objects into Jajom classes, or as an alternative
  // way to do inheritance.
  //    // For example, here is a way of turning a Backbone View into a Jajom class:
  //    var View = Jajom.create(Backbone.View)
  var create = function (parent, source) {
    var Sub = Class.extend(parent.prototype)
    if (source) Sub = Sub.extend(source)
    return Sub
  }

  return {
    Class: Class,
    create: create
  }

})
