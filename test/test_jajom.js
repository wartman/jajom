var expect = require('chai').expect
var jajom = require('../dist/jajom.min')

describe('jajom', function () {

  var Base
  beforeEach(function () {
    Base = jajom.Object.extend(function (n) {
      this.n = n
    })
  })

  it('casts an object into a jajom.Object', function () {
    var Test = jajom({
      foo: 'foo'
    })
    var TestTwo = Test.extend().methods({
      bar: 'bar'
    })
    var test = Test.create()
    var testTwo = TestTwo.create()
    expect(test.foo).to.equal('foo')
    expect(testTwo.foo).to.equal('foo')
    expect(testTwo.bar).to.equal('bar')
  })

  it('casts a function into a jajom.Object', function () {
    var Test = jajom(function (n) {
      this.foo = n
    })
    var test = Test.create(5)
    expect(test.foo).to.equal(5)
  })

  it('casts a generic javascript class into a jajom.Object and does not overwrite the original', function () {
    var Test = function (n) {
      this.foo = n
    }
    Test.prototype.bar = function () {
      return this.foo + 'bar'
    }
    var TestTwo = jajom(Test)
    var TestThree = TestTwo.extend({
      constructor: function (n) {
        this.sup(n)
      },
      bar: function () {
        return this.sup() + 'bin'
      }
    })
    expect(Test).to.not.equal(TestTwo)
    var test = TestTwo.create('foo')
    var testThree = TestThree.create('foo')
    expect(test.foo).to.equal('foo')
    expect(test.bar()).to.equal('foobar')
    expect(testThree.foo).to.equal('foo')
    expect(testThree.bar()).to.equal('foobarbin')
  })

  it('can call sup on casted constructors', function () {
    var Test = function (n) {
      this.foo = n
    }
    Test.prototype.bar = function () {
      return this.foo + 'bar'
    }
    var TestTwo = jajom(Test)
    var TestThree = TestTwo.extend(function (n) {
      n += 'foo'
      this.sup(n)
    })
    var test = new TestThree('foo')
    expect(test.foo).to.equal('foofoo')
    expect(test.bar()).to.equal('foofoobar')
  })

  it('properly assigns prototypes from casted objects', function () {
    var called = 0
    var foo = 'foo'
    var Test = function (n) {
      this.foo = n
    }
    Test.prototype.bar = function () {
      called = 1
    }
    var TestTwo = jajom(Test).methods({
      bar: function () {
        called = 2
      }
    })
    var TestThree = TestTwo.extend({
      bar: function () {
        called = 3
      }
    })
    var test = new Test('foo')
    test.bar()
    expect(called).to.equal(1)
    expect(test.foo).to.equal('foo')
    test = TestThree.create()
    test.bar()
    expect(called).to.equal(3)
    expect(test.foo).to.be.an('undefined')
    test = TestTwo.create()
    test.bar()
    expect(called).to.equal(2)
    expect(test.foo).to.be.an('undefined')
  })
  
  it('overwrites methods and forces the new object to use jajom\'s', function () {
    var Test = function (n) {
      this.foo = n
    }
    Test.extend = function (obj) {
      this.prototype = obj
    }
    Test.prototype.bar = function () {
      return this.foo + 'bar'
    }
    var TestTwo = jajom(Test)
    expect(TestTwo.extend).to.equal(jajom.Object.extend)
    var TestThree = TestTwo.extend({
      bar: function () {
        return this.sup() + 'bin'
      }
    })
    expect(TestThree.create('foo').bar()).to.equal('foobarbin')
  })

  describe('#Object', function () {

    it('creates an instance of a class', function () {
      var base = new Base(5)
      expect(base.n).to.equal(5)
    })

    describe('#extend', function () {

      it('defines the constructor when a function is passed', function () {
        var Base = jajom.Object.extend(function () {
          this.foo = 'foo'
        })
        var test = new Base()
        expect(test.foo).to.equal('foo')
      })

      it('defines methods when an object-literal is passed', function () {
        var Test = jajom.Object.extend({
          get: function () {
            return this.foo
          },
          set: function (foo) {
            this.foo = foo
            return this
          }
        })
        var test = new Test()
        test.set('bar')
        expect(test.get()).to.equal('bar')
      })

      it('defines statics if an object is passed as a second argument', function () {
        var Test = jajom.Object.extend({
          // Nada
        }, {
          get: function () {
            return this.foo
          },
          set: function (foo) {
            this.foo = foo
            return this
          }
        })
        Test.set('bar')
        expect(Test.get()).to.equal('bar')
      })

      it('does not call constructor twice', function (done) {
        var called = 0
        var timer = setTimeout(function () {
          expect(called).to.equal(1)
          done()
        }, 200)
        var Base = jajom.Object.extend(function () {
          called += 1
        })
        new Base()
      })

      it('does not call first class\' constructor when extending', function () {
        var called = 0
        var Base = jajom.Object.extend(function () {
          called += 1
        })
        var Sub = Base.extend()
        expect(called).to.equal(0)
      })

      it('does not call first class\' constructor when extending (object-literal syntax)', function () {
        var called = 0
        var Base = jajom.Object.extend({
          constructor: function () {
            called += 1
          }
        })
        var Sub = Base.extend()
        expect(called).to.equal(0)
      })

      it('doesn\'t bubble constructor to sub-classes', function () {
        var called = 0
        var Foo = jajom.Object.extend(function() {
          called += 1
        })
        var Bar = Foo.extend(function() {
          called += 1
        })
        var Baz = Bar.extend(function() {
          called += 1
        })
        //should only fire Baz's constructor
        var baz = new Baz()
        expect(called).to.equal(1)
      })

      it('does not call constructor twice when no constructor used in sub', function (done) {
        called = 0
        var timer = setTimeout(function () {
          expect(called).to.equal(1)
          done()
        }, 200)
        var Base = jajom.Object.extend(function () {
          called += 1
        })
        var Sub = Base.extend()
        new Sub()
      })

      it('does not call constructor twice when object used in sub', function (done) {
        called = 0
        var timer = setTimeout(function () {
          expect(called).to.equal(1)
          done()
        }, 200)
        var Base = jajom.Object.extend(function () {
          called += 1
        })
        var Sub = Base.extend({
          foo: function(){}
        })
        new Sub()
      })

      it('defines the constructor when `constructor` is passed as a key in an object-literal', function () {
        var Test = jajom.Object.extend({
          constructor: function () {
            this.foo = 'bar'
          },
          get: function () {
            return this.foo
          },
          set: function (foo) {
            this.foo = this.foo + foo
            return this
          }
        })
        var test = new Test()
        expect(test.foo).to.equal('bar')
        test.set('bar')
        expect(test.get()).to.equal('barbar')
      })

      it('doesn\'t bubble constructor when object-literal is used', function () {
        var called = 0
        var Foo = jajom.Object.extend({
          constructor: function() {
            called += 1
          }
        })
        var Bar = Foo.extend({
          constructor: function() {
            called += 1
          }
        })
        var Baz = Bar.extend({
          constructor: function() {
            called += 1
          }
        })
        //should only fire Baz's constructor
        var baz = new Baz()
        expect(called).to.equal(1)
      })

      it('can access constructor within constructor', function () {
        var Base = jajom.Object.extend(function () {
          expect(this.constructor.foo).to.equal('foo')
        }).statics({
          foo: 'foo'
        })
        new Base()
      })

      it('should inherit from superclass', function () {
        var Sub = Base.extend()
        var test = new Sub(5)
        expect(test.n).to.equal(5)
      })

      it('should inherit super methods', function () {
        var Base = jajom.Object.extend(function () {}).methods({
          foo: function () {
            return 'foo'
          }
        })
        var Sub = Base.extend(function () {})
        var test = new Sub()
        expect(test.foo).to.be.a('function')
        expect(test.foo()).to.equal('foo')
      })

      describe('#sup', function () {

        it('should call super methods from sub methods (including constructor)', function () {
          var methodTimes = 0
          var constructTimes = 0
          Base.methods({
            foo: function () {
              ++methodTimes
              expect(methodTimes).to.equal(1)
            }
          })
          var Sub = Base.extend(function () {
            constructTimes += 1
            expect(constructTimes).to.equal(1)
          }).methods({
            foo: function () {
              this.sup()
              ++methodTimes
              expect(methodTimes).to.equal(2)
            }
          })
          var SubTwo = Sub.extend(function () {
            this.sup()
            constructTimes += 1
            expect(constructTimes).to.equal(2)
          }).methods({
            foo: function () {
              this.sup()
              ++methodTimes
              expect(methodTimes).to.equal(3)
            }
          })
          var test = new SubTwo()
          expect(constructTimes).to.equal(2)
          test.foo()
          expect(methodTimes).to.equal(3)
        })

        it('should access the correct sup method', function () {
          Base.methods({
            first: function () {
              return 'first'
            },
            second: function () {
              return 'second'
            }
          })
          var Sub = Base.extend({
            first: function () {
              this.second()
              return this.sup()
            },
            second: function () {
              return this.sup()
            }
          })
          var base = new Base()
          var sub = new Sub()
          expect(base.first()).to.equal('first')
          expect(base.second()).to.equal('second')
          expect(sub.first()).to.equal('first')
          expect(sub.second()).to.equal('second')
        })

        it('should reset when exceptions are thrown', function () {
          var caught = false
          var Base = jajom.Object.extend({
            thrower: function () {
              throw new Exception()
            },
            catcher: function () {
              caught = true
            }
          })
          var Sub = Base.extend({
            thrower: function () {
              this.sup()
            },
            catcher: function () {
              try {
                this.thrower()
              } finally {
                this.sup()
              }
            }
          })
          var test = new Sub()
          try {test.catcher()} catch (ignored) {}
          expect(caught).to.be.true
        })

      })

      describe('#implement', function () {

        it('mixins attributes to instances, can call `sup`', function () {
          methodTimes = 0
          Base.methods({
            foo: function () {
              ++methodTimes
              expect(methodTimes).to.equal(1)
            }
          })
          var Sub = Base.extend().methods({
            foo: function () {
              this.sup()
              ++methodTimes
              expect(methodTimes).to.equal(2)
            }
          })
          var test = new Sub()
          test.implement({
            foo: function () {
              this.sup()
              expect(methodTimes).to.equal(2)
              this.bar()
            },
            bar: function () {
              ++methodTimes
              expect(methodTimes).to.equal(3)
            }
          })
          test.foo()
          expect(methodTimes).to.equal(3)
        })

      })

    })

    describe('#methods', function () {

      it('should define methods', function () {
        Base.methods({
          get: function () {
            return this.n
          }
        })
        var test = new Base(5)
        expect(test.get()).to.equal(5)
      })

    })

    describe('#statics', function () {

      it('sets static methods', function () {
        Base.statics({
          foo: 'bar'
        })
        expect(Base.foo).to.equal('bar')
      })

      it('can access statics within statics', function () {
        var Base = jajom.Object.extend().statics({
          foo: function () {
            expect(this.bar).to.equal('bar')
          },
          bar: 'bar'
        })
        Base.foo()
      })

      describe('#sup', function () {

        it('calls the parent method', function () {
          methodTimes = 0
          Base.statics({
            foo: function () {
              ++methodTimes
              expect(methodTimes).to.equal(1)
            }
          })
          var Sub = Base.extend().statics({
            foo: function () {
              this.sup()
              ++methodTimes
              expect(methodTimes).to.equal(2)
            }
          })
          var SubTwo = Sub.extend().statics({
            foo: function () {
              this.sup()
              ++methodTimes
              expect(methodTimes).to.equal(3)
            }
          })
          SubTwo.foo()
          expect(methodTimes).to.equal(3)
        })

      })

    })

    describe('#create', function () {

      it('should create a new instance', function () {
        var test = Base.create(5)
        expect(test.n).to.equal(5)
      })

      it('should allow you to apply arguments', function () {
        var test = Base.create.apply(Base, [5])
        expect(test.n).to.equal(5)
      })

      it('should be inherited', function () {
        var count = 0
        var Sub = Base.extend(function (n) {
          this.sup(n)
          count += 1
          this.n += 1
        })
        var test = Sub.create.apply(Sub, [5])
        expect(test.n).to.equal(6)
        expect(count).to.equal(1)
      })

    }),

    describe('instances', function () {

      it('should be an instance of the parent classes', function () {
        var Sub = Base.extend()
        var a = new Base()
        var b = new Sub()
        expect(a).to.be.an.instanceOf(Base)
        expect(b).to.be.an.instanceOf(Sub)
      })

    })
  })

  describe('Singleton', function () {

    describe('#getInstance', function () {

      it('returns a single instance', function () {
        var Test = jajom.Singleton.extend(function () {
          this.foo = 'foo'
        })
        expect(Test.getInstance().foo).to.equal('foo')
        Test.getInstance().foo = 'bar'
        expect(Test.getInstance().foo).to.equal('bar')
      })

    })

    describe('#setInstance', function () {

      it('can be used to initialize a singleton', function () {
        var Test = jajom.Singleton.extend(function (foo) {
          this.foo = foo
        })
        Test.setInstance('bar')
        expect(Test.getInstance().foo).to.equal('bar')
        Test.setInstance('bin')
        expect(Test.getInstance().foo).to.equal('bin')
      })

    })

  })

})