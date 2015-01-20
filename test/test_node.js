var expect = require('expect.js')
var Jajom = require('../src/class-node')

describe('(node) Jajom', function () {

  describe('#create', function () {

    var Mock = function () {
      this.foo = 'foo'
    }
    Mock.prototype.getFoo = function () {
      return this.foo
    }
    Mock.extend = function (foo) {
      return Mock
    }

    it('casts objects into Jajom objects', function () {
      var Expected = Jajom.create(Mock)
      expect(Expected.extend).to.equal(Jajom.Class.extend)
      var expected = new Expected()
      expect(expected.getFoo()).to.equal('foo')
    })

    it('creates objects that work as expected', function () {
      var Expected = Jajom.create(Mock)
      var Sub = Expected.extend({
        constructor: function () {
          this.super()
          this.bar = 'bar'
        }
      })
      var expected = new Sub()
      expect(expected.foo).to.equal('foo')
      expect(expected.bar).to.equal('bar')
    })

    it('extends cast objects if needed', function () {
      var Expected = Jajom.create(Mock, {
        getBar: function () {
          return 'bar'
        }
      })
      var expected = new Expected()
      expect(expected.foo).to.equal('foo')
      expect(expected.getBar()).to.equal('bar')
    })

  })

  describe('#Class', function () {

    var Class = Jajom.Class
    
    describe('#extend', function () {

      it('creates a new class', function () {
        var Test = Class.extend({
          constructor: function () {
            this.foo = 'foo'
          }
        })
        expect(Test).to.be.a('function')
        expect(Test.extend).to.equal(Class.extend)
        var test = new Test()
        expect(test).to.be.a(Test)
        expect(test.foo).to.equal('foo')
      })

      it('does not allow you to set properties on the prototype', function () {
        expect(function () {
          var Test = Class.extend({
            foo: 'foo'
          })
        }).to.throwException()
      })

      it('inherits instance methods', function () {
        var Test = Class.extend({
          constructor: function (foo) {
            this.setFoo(foo)
          },
          getFoo: function () {
            return this.foo
          },
          setFoo: function (foo) {
            this.foo = foo
          }
        })
        expect(Test.prototype.getFoo).to.be.a('function')
        var test = new Test('foo')
        expect(test.getFoo).to.be.a('function')
        expect(test.setFoo).to.be.a('function')
        expect(test.getFoo()).to.equal('foo')
        test.setFoo('bar')
        expect(test.getFoo()).to.equal('bar')
      })

      it('does not call constructor twice', function (done) {
        var called = 0
        var timer = setTimeout(function () {
          expect(called).to.equal(1)
          done()
        }, 200)
        var Base = Class.extend({
          constructor: function () {
            called += 1
          }
        })
        new Base()
      })

      it('does not call first class\' constructor when extending', function () {
        var called = 0
        var Base = Class.extend({
          constructor: function () {
            called += 1
          }
        })
        var Sub = Base.extend()
        expect(called).to.equal(0)
      })

      it('doesn\'t bubble constructor to sub-classes', function () {
        var called = 0
        var Foo = Class.extend({
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

      it('does not call constructor twice when no constructor used in sub', function (done) {
        called = 0
        var timer = setTimeout(function () {
          expect(called).to.equal(1)
          done()
        }, 200)
        var Base = Class.extend({
          constructor: function () {
            called += 1
          }
        })
        var Sub = Base.extend()
        expect(Sub.prototype._constructor).to.equal(Base.prototype._constructor)
        new Sub()
      })

      it('does not call constructor twice when sub is extended with an object', function (done) {
        called = 0
        var timer = setTimeout(function () {
          expect(called).to.equal(1)
          done()
        }, 200)
        var Base = Class.extend({
          constructor: function () {
            called += 1
          }
        })
        var Sub = Base.extend({
          foo: function(){}
        })
        new Sub()
      })

      it('can access constructor within constructor', function () {
        var Base = Class.extend({
          constructor: function () {
            expect(this.constructor.foo).to.equal('foo')
          }
        })
        Base.foo = 'foo'
        new Base()
      })

      it('should inherit from superclass', function () {
        var Sub = Class.extend({
          constructor: function (n) {
            this.n = n
          }
        })
        var test = new Sub(5)
        expect(test.n).to.equal(5)
      })

      it('should inherit super methods', function () {
        var Base = Class.extend({
          foo: function () {
            return 'foo'
          }
        })
        var Sub = Base.extend()
        var test = new Sub()
        expect(test.foo).to.be.a('function')
        expect(test.foo()).to.equal('foo')
      })

    })

    describe('#super', function () {

      it('does not endlessly loop', function () {
        var _called = ''
        var Test = Class.extend({
          constructor: function () {
            _called += 'first'
          }
        })
        var SubTest = Test.extend({
          constructor: function () {
            _called += 'second'
            this.super()
          }
        })
        var SubSubTest = SubTest.extend({
          constructor: function () {
            _called += 'last'
            this.super()
          }
        })
        var test = new SubSubTest()
        expect(_called).to.equal('lastsecondfirst')
      })

      it('can use `_super` instead of `super`', function () {
        var _called = ''
        var Test = Class.extend({
          constructor: function () {
            _called += 'first'
          }
        })
        var SubTest = Test.extend({
          constructor: function () {
            _called += 'second'
            this._super()
          }
        })
        var SubSubTest = SubTest.extend({
          constructor: function () {
            _called += 'last'
            this._super()
          }
        })
        var test = new SubSubTest()
        expect(_called).to.equal('lastsecondfirst')
      })

      it('does not exceed max-call-stack when calling constructor directly', function () {
        var Test = Class.extend({
          constructor: function (n) {
            this.foo = n
          },
          bar: function () {
            return this.foo + 'bar'
          }
        })
        var TestTwo = Test.extend({
          constructor: function (n) {
            Test.call(this, n)
          }
        })
        var TestThree = TestTwo.extend({
          constructor: function (n) {
            TestTwo.call(this, n)
          },
          bar: function () {
            return this.super() + 'bin'
          }
        })
        var test = new TestThree(5)
        // If all is well, then no errors will have been thrown.
        expect(true).to.be.true
      })

      it('does not exceed max-call-stack when calling constructor via #super', function () {
        var Test = Class.extend({
          constructor: function (n) {
            this.foo = n
          },
          bar: function () {
            return this.foo + 'bar'
          }
        })
        var TestTwo = Test.extend({
          constructor: function (n) {
            this.super(n)
          }
        })
        var TestThree = TestTwo.extend({
          constructor: function (n) {
            this.super(n)
          },
          bar: function () {
            return this.super() + 'bin'
          }
        })
        var test = new TestThree(5)
        // If all is well, then no errors will have been thrown.
        expect(true).to.be.true
      })

      it('passes arguments to super calls', function () {
        var Test = Class.extend({
          constructor: function (foo) {
            this.setFoo(foo)
          },
          getFoo: function (append) {
            return this.foo + append
          },
          setFoo: function (foo) {
            this.foo = foo
          }
        })
        var TestTwo = Test.extend({
          constructor: function () {
            this.super('foo')
          },
          getFoo: function () {
            return this.super('bar')
          }
        })
        var test = new TestTwo()
        expect(test.getFoo()).to.equal('foobar')
      })

      it('should call super methods from sub methods (including constructor)', function () {
        var methodTimes = 0
        var constructTimes = 0
        var Base = Class.extend({
          foo: function () {
            ++methodTimes
            expect(methodTimes).to.equal(1)
          }
        })
        var Sub = Base.extend({
          constructor: function () {
            constructTimes += 1
            expect(constructTimes).to.equal(1)
          },
          foo: function () {
            this.super()
            ++methodTimes
            expect(methodTimes).to.equal(2)
          }
        })
        var SubTwo = Sub.extend({
          constructor: function () {
            this.super()
            constructTimes += 1
            expect(constructTimes).to.equal(2)
          },
          foo: function () {
            this.super()
            ++methodTimes
            expect(methodTimes).to.equal(3)
          }
        })
        var test = new SubTwo()
        expect(constructTimes).to.equal(2)
        test.foo()
        expect(methodTimes).to.equal(3)
      })

      it('should access the correct super method', function () {
        var Base = Class.extend({
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
            return this.super()
          },
          second: function () {
            return this.super()
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
        var Base = Class.extend({
          thrower: function () {
            throw new Exception()
          },
          catcher: function () {
            caught = true
          }
        })
        var Sub = Base.extend({
          thrower: function () {
            this.super()
          },
          catcher: function () {
            try {
              this.thrower()
            } finally {
              this.super()
            }
          }
        })
        var test = new Sub()
        try {test.catcher()} catch (ignored) {}
        expect(caught).to.be.true
      })

    })

  })

})
