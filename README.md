# lambda
Use symbol λ in JavaScript to write functions in a style which reduces duplication.

# example
~~~JavaScript
var iv = λ(λ.iv(a, b(i, v)), a)
var kv = λ(λ.kv(a, b(k, v)), a)
var object_size = λ(0, λ.k(a, A.inc()), A)
var zip = λ([], λ.iv(a, A.push([v, b.at(i)])), A)
var any = λ(λ.iv(a, λ.fi(b(v), λ.r(true))), false)
var keysAndValues = λ([], [], λ.kv(a, A.push(k), B.push(v)), [A, B])

// vs.

var iv = function(array, func) {
	var length = array.length
	for (var i = 0; i < length; ++i) {
		func(i, array[i])
	}
	return array
}

var kv = function(object, func) {
	for (var k in object) {
		if (object.hasOwnProperty(k)) {
			func(k, object[k])
		}
	}
	return object
}

var object_size = function(object) {
	var size = 0
	kv(object, function() {++size})
	return size
}

var zip = function(a, b) {
	var result = []
	iv(a, function(i, v) {
		result.push([v, b[i]])
	})
	return result
}

var any = function(array, pred) {
	var length = array.length
	for (var i = 0; i < length; ++i) {
		if (pred(array[i])) {
			return true
		}
	}
	return false
}

var keysAndValues = function(object) {
	var keys = []
	var values = []
	kv(object, function(k, v) {
		keys.push(k)
		values.push(v)
	})
	return [keys, values]
}
~~~
The variables a, b, A, B, k, and v were placeholders.
~~~JavaScript
// add placeholders to the scope
eval(λ.localPlaceholders())

v.toString() // returns 'v'
A.push(k) // returns 'A.push(k)'
b(a) // returns 'b(a)'

// add placeholders with a prefix
eval(λ.localPlaceholders('λ'))

λa.apply(λnil, λb, λA) // returns 'a.apply(null, b, A)'
λa.push(λthat) // returns 'a.push(this)'
~~~
# λ rules
- Each parameter to λ is a line in the resulting function.
- Lines that do not begin with some control statement (for, if, return, etc) are treated as variable initializations.
- The first variable is named A for you, the second named B, and so on.
- If the last line of the function does not begin with a control statement, it is returned.
- λ.kv is one of 6 looping functions. They loop over a collection (either an array or an object, or either in KV's case), expanding into inlined for-loops.
- Non-string arguments are converted to string. Eg: [] and [A, B] are converted to '[]' and '[A, B]'.

# more examples
~~~JavaScript
eval(λ.localPlaceholders('λ')) // prefixes placeholders with 'λ'

// Use upper case λ, Λ, to add comments, typically pertaining to the expected arguments

// This function relies on the built-in javascript toString
// function dumping the function in its readable JavaScript form.
// This makes it easy to write λ's within λ's, but
// just remember that each λ will get its own a, b, c, etc arguments,
// so you must store the current arguments in local variables.
var identity_func = Λ('value')(λa, λ(λA))

indentity_func(6)() === 6

// nil placeholder, replaced with 'null'
// also, λ.r, which prefixes is argument with 'return '
// λ.k loops over all keys of an object
var firstKey = Λ('object')(λ.k(λa, λ.r(λk)), λnil)

// the args placeholder is replaced with 'arguments'
var make_interactive_webpage = Λ('messages...')(λ.iv(λargs, 'alert(v)'))

make_interactive_webpage (
	'Congradulations!!!',
	'Welcome to my homepaeg',
	'Click below to get started',
	'Ok now just wait here'
)
~~~

# overhead
There is some overhead in creating functions using λ. For this reason, λ should be avoided for "on the fly" function creation, such as this:
~~~JavaScript
var someFrequentlyCalledFunction = function(values) {
	return values.map(λ('a + 1'))
}
~~~
For this case, we could have written someFrequentlyCalledFunction using λ and avoided the "on the fly" problem:
~~~JavaScript
var someFrequentlyCalledFunction = Λ('values')(λa.map(λ('a + 1')))
~~~
For cases such as large functions or functions containing large literals, λ might be avoided.
