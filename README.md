# lambda
Use symbol λ in JavaScript to write succient functions. Hides the noise of common composition patterns.
# Introduction
Lets imagine we want to write some simple functions to wrap binary operators:
~~~JavaScript
var add = function(a, b) {return a + b}
var sub = function(a, b) {return a - b}
var mul = function(a, b) {return a * b}
var div = function(a, b) {return a / b}
~~~
From a minimalist perspective, what do all of these functions have in common besides being binary operator wrappers?
- They return a transformation upon their arguments.
- Their readability is largely independent of their argument names (could have used x and y). What is really important is that we can match an argument to its usage.
- They require relatively verbose keywords.

Arrow functions clean this up a little bit:
~~~JavaScript
var add = (a, b) => a + b
var sub = (a, b) => a - b
var mul = (a, b) => a * b
var div = (a, b) => a / b
~~~
However, if cases exist where argument names don't really matter, then why do I have to keep defining the argument names anyways? Can't somebody just give me standard names so I don't have to think about or repeat them?

Some languages have addressed this in one form or another through placeholders, although not always explicitly for this purpose. They are commonly used in binding expressions:
~~~C++
using namespace std::placeholders;

auto sub = [](int a, int b) {return a - b;};

// _1 is a placeholder for the first argument
auto minus_one = std::bind(sub, _1, 1);
~~~
Why not create a simple helper for this pattern of unimportant argument names?
~~~JavaScript
var λ = function(expr) {
	return new Function('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'return ' + expr)
}

var add = λ('a + b')
var sub = λ('a - b')
var mul = λ('a * b')
var div = λ('a / b')
~~~
The Function constructor takes argument names up to the last parameter, which is the function body. In this case, the arguments bind to instances of a, b, c, etc in expr. There's some overhead in creating these functions, but in this case, they are created once at startup, after which are just as performant as the other forms.

That's kinda cool, but there has to be more this idea can offer. After all, in this form, the use cases are rather limited. Consider the following functions:
~~~JavaScript
var iv = function(array, func) {
	var length = array.length
	for (var i = 0; i < length; ++i) {
		func(i, array[i])
	}
	// might as well return array so that we can chain off of the result
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

// a short circuiting operation needs to hand roll a loop,
// or needs another looping helper we didn't write here, and one which would do redundant branching.
var any = function(array, pred) {
	var length = array.length
	for (var i = 0; i < length; ++i) {
		if (pred(array[i])) {
			return true
		}
	}
	return false
}


~~~
These would be a nightmare in the current form of λ. We would have a huge ugly string of code with zero syntax highlighting. So what do these functions have in common?
- All but kv initialize a result variable.
- They iterate through a collection to produce a result, sometimes needing to short circuit.
- They return their result/something.
- Argument naming somewhat matters, but the choices made were rather arbitrary (why not obj, arr, array1, array2, etc?).

Perhaps we should wrap these patterns up as well. First of all, iteration standards like iv and kv should have a standard short syntax, and its not enough to just write an iv and kv function, because sometimes you want to short circuit. What if we could write these helpers like:
~~~JavaScript
var object_size = λ(0, λ.k(a, '++A'), A)
var zip = λ([], λ.iv(a, A.push([v, 'b[i]'])), A)
var any = λ(λ.iv(a, λ.fi(b(v), λ.r(true))), false)
~~~
What the heck is going on here? A whole lot of confusion, but lets start with a single example (And hopefully eventually get our argument names back so we know what to pass the functions):
~~~JavaScript
var keysAndValues = λ([], [], λ.kv(a, A.push(k), B.push(v)), [A, B])

keysAndValues({
	left: 1,
	right: -2
}) // returns [['left', 'right'], [1, -2]], order depending on hash however
~~~

This also assumes placeholders are applied to the local scope, which explain where the a, A, B, k, and v variables are coming from. Let's break this down:
~~~JavaScript
eval(λ.localPlaceholders()) // creates placeholders in current scope

A.push(k) // returns 'A.push(k)'
~~~
A is a placeholder, a function with toString() overloaded to return 'A', and the member 'push' returning 'A.push(...)'. Calling a placeholder has this effect:
~~~JavaScript
A(a, b) // returns 'A(a, b)'
~~~
Break down:
- Each parameter to λ is a line in the resulting function.
- Lines that do not begin with some control statement (for, if, return, etc) are treated as variable initializations.
- The first variable is named A for you, the second named B, and so on.
- If the last line of the function does not begin with a control statement, it is returned.
- λ.kv is one of 6 looping functions. They loop over a collection (either an array or an object, or either in KV's case), expanding into inlined for-loops.
- [] and [A, B] are detected as arrays, and arrays are converted to strings such as '[]' and '[A, B]'.

# more cool stuff
~~~JavaScript
eval(λ.localPlaceholders('λ')) // prefixes placeholders with 'λ'

// Use uppercase lambda, Λ, to add comments.
// Comments pertaining to the required arguments are useful.

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

# Overhead
If you take a look at the source, you will notice that there is some non-trivial overhead in creating functions using λ. For this reason, λ should be avoided for "on the fly" function creation, such as this:
~~~JavaScript
var someFrequentlyCalledFunction = function(values) {
	return values.map(λ('a + 1'))
}
~~~
For this case, we could have easily written someFrequentlyCalledFunction using λ and avoided the "on the fly" problem, taking advantage of one-time initialization:
~~~JavaScript
var someFrequentlyCalledFunction = Λ('values')(λa.map(λ('a + 1')))
~~~
However, sometimes this isn't easy when a function is very large or contains large literals. λ should be used for somewhat simple functions, as the readability suffers as complexity increases.
