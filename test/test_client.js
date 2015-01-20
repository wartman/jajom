var expect = require('expect.js')
var Jajom = require('../src/class-client')

describe('(client) Jajom', function () {

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
      expect(Expected.prototype.__constructor).to.equal(Mock)
      var expected = new Expected()
      expect(expected.getFoo()).to.equal('foo')
    })

    it('creates objects that work as expected', function () {
      var Expected = Jajom.create(Mock)
      var Sub = Expected.extend({
        constructor: function () {
          this._super()
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

      it('aliases `constructor` to `__constructor` in new classes', function () {
        var constructor = function () {
          this.foo = 'foo'
        }
        var Test = Class.extend({
          constructor: constructor
        })
        expect(Test.prototype.__constructor).to.equal(constructor)
        var test = new Test()
        expect(test.foo).to.equal('foo')
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

    describe('#_super', function () {

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
            return this._super() + 'bin'
          }
        })
        var test = new TestThree(5)
        // If all is well, then no errors will have been thrown.
        expect(true).to.be.true
      })

      it('does not exceed max-call-stack when calling constructor via #_super', function () {
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
            this._super(n)
          }
        })
        var TestThree = TestTwo.extend({
          constructor: function (n) {
            this._super(n)
          },
          bar: function () {
            return this._super() + 'bin'
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
            this._super('foo')
          },
          getFoo: function () {
            return this._super('bar')
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
            this._super()
            ++methodTimes
            expect(methodTimes).to.equal(2)
          }
        })
        var SubTwo = Sub.extend({
          constructor: function () {
            this._super()
            constructTimes += 1
            expect(constructTimes).to.equal(2)
          },
          foo: function () {
            this._super()
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
            return this._super()
          },
          second: function () {
            return this._super()
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
            this._super()
          },
          catcher: function () {
            try {
              this.thrower()
            } finally {
              this._super()
            }
          }
        })
        var test = new Sub()
        try {test.catcher()} catch (ignored) {}
        expect(caught).to.be.true
      })

    })

    describe('#toString', function () {

      it('does not exceed max-call-stack when calling toString on constructor', function () {
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
            this._super(n)
          }
        })
        var TestThree = TestTwo.extend({
          constructor: function (n) {
            this._super(n)
          },
          bar: function () {
            return this._super() + 'bin'
          }
        })  
        TestTwo.toString()
        TestThree.toString()
        // If all is well, then no errors will have been thrown.
        expect(true).to.be.true
      })

      it('uses the wrapped constructor', function () {
        var testConstructor = function () {
          this.hello = 'hello world'
        }
        var extendedConstructor = function () {
          this._super()
          this.hello = this.hello
        }
        var Test = Class.extend({
          constructor: testConstructor
        })
        var TestTwo = Test.extend()
        var TestThree = TestTwo.extend({
          constructor: extendedConstructor
        })
        expect(Test.toString()).to.equal(testConstructor.toString())
        expect(TestTwo.toString()).to.equal(testConstructor.toString())
        expect(TestThree.toString()).to.equal(extendedConstructor.toString())
      })

    })

  })

})
