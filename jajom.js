!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
}('Jajom', this, function () {

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
  //
  // The second argument is an object of options which can be used to
  // set up the Object's meta properties. Right now, that's just `skipConstructor`,
  // which is used during composition.
  Jajom.extend = function extend(source, options) {
    source || (source = {})
    options || (options = {})

    var parent = this
    var constructor = source.hasOwnProperty('constructor') ? source.constructor : parent
    var ctor = function Object() {
      if (!this.constructor.__meta.skipConstructor) {
        constructor.apply(this, Array.prototype.slice.call(arguments, 0))
      }
    }
    
    delete source.constructor

    ctor.prototype = create(parent.prototype, getOwnPropertyDescriptors(source))
    ctor.prototype.constructor = ctor
    
    // Setup the class's metadata
    ctor.__meta = assign({ skipConstructor: false }, options)

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
  Jajom.compose = function () {
    var parent = this
    var dst = this.extend({
      constructor: function () {
        var self = this
        var args = Array.prototype.slice.call(arguments, 0)
        self.constructor.__meta.ctors.forEach(function (ctor) {
          ctor.apply(self, args)
        })
      }
    })
    var objs = Array.prototype.slice.call(arguments, 0)

    dst.__meta.ctors = []

    objs.forEach(function (obj) {
      if (false !== obj.__meta.skipConstructor) {
        dst.__meta.ctors.push(obj)
      }
      defineProperties(dst.prototype, getOwnPropertyDescriptors(obj.prototype))
    })

    // Add the current object's constructor last.
    dst.__meta.ctors.push(parent)

    return dst
  }

  return Jajom

})
