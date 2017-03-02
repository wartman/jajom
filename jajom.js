!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
}('Jajom', this, function () {

  // todo: add shims?
  var create = Object.create
  var assign = Object.assign
  var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors
  var defineProperties = Object.defineProperties

  var jajomMethods = ['extend', 'compose']

  var Jajom = function Object() {
    // noop
  }

  // Extend an object. This will return a new object, not modify the
  // current one.
  Jajom.extend = function extend(source) {
    source || (source = {})

    var parent = this
    var constructor = source.hasOwnProperty('constructor') ? source.constructor : parent
    var ctor = function Object() {
      constructor.apply(this, Array.prototype.slice.call(arguments, 0))
    }
    
    delete source.constructor

    ctor.prototype = create(parent.prototype, getOwnPropertyDescriptors(source))
    ctor.prototype.constructor = ctor

    // Add static methods.
    jajomMethods.forEach(function (key) {
      ctor[key] = Jajom[key]
    })

    return ctor
  }

  // Compose jajom objects.
  //
  // Constructors will be called in the order they are added when the created object
  // is initialized. Keep this in mind when considering how arguments will be applied,
  // as each constructor will receive the same ones.
  //
  // This method creates a new object in the current object's prototype chain.
  //
  // TODO: 
  //      - It'd be nice to have access to the constructor list somewhere.
  //      - Do we need a list of objects each object composes somewhere? For reflection/type checks?
  Jajom.compose = function compose() {
    var parent = this
    var ctors = []
    var dst = this.extend({
      constructor: function () {
        var self = this
        var args = Array.prototype.slice.call(arguments, 0)
        ctors.forEach(function (ctor) {
          ctor.apply(self, args)
        })
      }
    })
    var objs = Array.prototype.slice.call(arguments, 0)

    objs.forEach(function (obj) {
      ctors.push(obj)
      defineProperties(dst.prototype, getOwnPropertyDescriptors(obj.prototype))
    })

    // Add the current object's constructor last.
    ctors.push(parent)

    return dst
  }

  return Jajom

})
