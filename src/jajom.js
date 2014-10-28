(function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition();
  else if (typeof define == 'function' && define.amd) define(definition);
  else context[name] = definition();
})('jajom', this, function () {

  var testSuper = /\bsup\b/;

  // Helpers
  // -------

  // Wrap a method for super calls.
  var wrap = function (method, parentMethod) {
    if (!parentMethod || 'function' !== typeof method) {
      return method;
    }
    if ((!parentMethod.valueOf || parentMethod.valueOf() != method.valueOf())
         && testSuper.test(method)) {
      var originalMethod = method.valueOf();
      // Override
      method = function () {
        var prev = this.sup || jajom.Object.prototype.sup;
        this.sup = parentMethod;
        try {
          var result = originalMethod.apply(this, arguments);
        } finally {
          this.sup = prev;
        }
        return result;
      };
      // Make valueOf and toString return the unwrapped functions,
      // which is a lot more useful for debugging / etc.
      method.valueOf = function (type) {
        return (type = 'object')? method : originalMethod;
      };
      method.toString = jajom.Object.toString;
      method.__hasSup = true;
    }
    return method;
  };

  // Mixin an object.
  var mixin = function (obj, src, options) {
    options = options || {};
    for (var key in src) {
      if (src.hasOwnProperty(key)) {
        if (options.noWrap) {
          obj[key] = src[key];
        } else {
          var parentProp = obj[key];
          obj[key] = wrap(src[key], parentProp);
        }
      }
    }
  };

  // jajom
  // -----  
  // Pass any function or object to `jajom`, and it will
  // be transformed into a `jajom.Object`.
  var jajom = function (obj) {
    if ('object' === typeof obj) {
      return jajom.Object.extend(obj);
    }
    return jajom.Object.extend(obj)
      .methods(obj.prototype, jajom.Object.prototype)
      .statics(obj, jajom.Object);
  };

  // jajom.Object
  // ------------
  // The core object all classes inherit from.
  jajom.Object = function () {
    // Dummy
  };

  // Extend the base object and create a new class.
  jajom.Object.extend = function (props, staticProps) {
    props = props || {};
    staticProps = staticProps || {};

    // If the first argument is a function, use it as
    // a constructor.
    if (typeof props === 'function') {
      var constructor = props;
      props = { constructor: constructor };
    }

    jajom.__prototyping = true;
    // Inherit prototype from the parent.
    var parent = this;
    var proto = new parent();
    // Mixin new prototype props.
    mixin(proto, props);
    delete jajom.__prototyping;

    // Create the constructor
    var constructor = proto.constructor;
    var SubClass = proto.constructor = function () {
      if (!jajom.__prototyping) {
        var result = constructor.apply(this, arguments);
        if (result) return result;
      }
    };

    // Inherit static props from the parent (without wrapping functions).
    mixin(SubClass, parent, {noWrap: true});

    // Make .valueOf return the actual content of the 
    // constructor, not our wrapped value.
    SubClass.valueOf = function (type) {
      return (type == "object") ? SubClass : constructor.valueOf();
    };

    // Set the parent reference
    SubClass.ancestor = parent;

    // Add in static props
    mixin(SubClass, staticProps);

    // Add proto props.
    SubClass.prototype = proto;
    SubClass.name = proto.name;

    return SubClass;
  };

  // Mixin prototype methods.
  jajom.Object.methods = function () {
    for (var i = 0; i <= arguments.length; i += 1) {
      mixin(this.prototype, arguments[i]);
    }
    return this;
  };

  // Mixin static methods.
  jajom.Object.statics = function () {
    for (var i = 0; i <= arguments.length; i += 1) {
      mixin(this, arguments[i]);
    }
    return this;
  };

  jajom.Object.valueOf = function (){
    return '[jajom.Object]';
  };

  jajom.Object.toString = function () {
    return String(this.valueOf());
  };

  // Default 'sup' function.
  jajom.Object.sup = function () {
    throw new Error('Called `sup` outside a class method');
  };
  jajom.Object.prototype.sup = jajom.Object.sup;

  // Mixin methods to an instance of an jajom Object.
  jajom.Object.prototype.implement = function () {
    for (var i = 0; i <= arguments.length; i += 1) {
      mixin(this, arguments[i]);
    }
    return this;
  };

  // An alternate way to create classes, handy if you need
  // to apply arguments to a new instance.
  jajom.Object.create = function () {
    var constructor = this;
    var args = arguments;
    var Surrogate = function() {
      return constructor.apply(this, args);
    }
    Surrogate.prototype = constructor.prototype;
    return new Surrogate();
  };

  // Ensure the correct constructor is set.
  jajom.Object.prototype.constructor = jajom.Object;

  // jajom.Singleton
  // ---------------
  // A special class designed to allow for the creation of
  // singletons.
  jajom.Singleton = jajom.Object.extend().statics({

    getInstance: function () {
      if (!this._instance) {
        this.setInstance();
      }
      return this._instance;
    },

    setInstance: function () {
      this._instance = this.create.apply(this, arguments);
    }

  });

  return jajom;

});