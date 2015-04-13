# lambda
Use symbol λ in JavaScript to write succient functions. λ hides the noise of common composition patterns.

# Introduction
The first version of the function was like this:
~~~JavaScript
var λ = function(expr) {
	return new Function('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'return ' + expr)
}
~~~
This allows writing functions like this:
~~~JavaScript
var add = λ('a + b')

add(8, 9) // returns 17
~~~
The Function constructor takes argument names until the last parameter, which is the function body. This causes the arguments to bind to instances of a, b, c, etc.

After adding some more complex features, I was able to write functions like this:

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
