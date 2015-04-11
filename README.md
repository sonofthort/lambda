# lambda
Use symbol λ in JavaScript to write succient functions.
# idea
The first version of the function was like this:
~~~
var λ = function(expr) {
	return new Function('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'return ' + expr)
}
~~~
This allows writing functions like this:
~~~
var add = λ('a + b')

add(8, 9) // returns 17
~~~
The Function constructor takes argument names until the last parameter, which is the function body. This causes the arguments to bind to instances of a, b, c, etc.

After adding some more complex features, I was able to write functions like this:

~~~
var keysAndValues = λ([], [], λ.kv(a, A.push(k), B.push(v)), [A, B])
~~~

This is a function which returns a pair of parallel arrays, one of the keys and one of the values of an object. It also assumes placeholders are applied to the local scope, which explain where the a, A, b, B, k, and v variables are coming from. Let's break this down:
~~~
eval(λ.localPlaceholders()) // creates placeholders in current scope

A.push(k) // returns 'A.push(k)'
~~~
A is a placeholder, a function with toString() overloaded to return 'A', and the member 'push' returning 'A.push(...)'. Calling a placeholder has this effect:
~~~
A(a, b) // returns 'A(a, b)'
~~~
Break down:
- Each parameter to λ is a line in the resulting function.
- Lines that do not begin with some control statement (for, if, return, etc) are treated as variable initializations.
- The first variable is named A for you, the second named B, and so on.
- If the last line of the function does not begin with a control statement, it is returned.
- λ.kv is one of 6 looping functions. They loop over a collection (either an array or an object, or either in KV's case), expanding into inlined for-loops.
- [] and [A, B] are detected as arrays, and arrays are converted to strings such as '[]' and '[A, B]'.
