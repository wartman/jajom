JAJOM
=====

"Just Another JavaScript OOP Module".

Inehritance with a little composition.

```javascript

const Fooable = Jajom.extend({

  constructor() {
    this.foo = 'foo'
  },

  getFoo() {
    return this.foo
  } 

})

const Barable = Jajom.extend({

  constructor() {
    this.bar = 'bar'
  },

  getBar() {
    return this.bar
  }

})

const FooBar = Jajom.extend({

  getFooBar() {
    return this.getBar() + " " + this.getFoo()
  }

}).compose(Fooable, Barable)

const test = new FooBar()
console.log(test.getFooBar()) // => 'bar foo'

```
