'use stict';

// Created by Eric Thortsen, see LICENSE or https://github.com/sonofthort/λ 

λ = {}

λ = function() {
	var lines = []
	try {
		function addLines(src, header) {
			var length = src.length,
				last = src.length - 1
			for (var i = 0; i < length; ++i) {
				var line = src[i]
				if (line instanceof Array) {
					line = '[' + line.join(', ') + ']'
				} else if (typeof line === 'object') {
					var values = []
					for (var k in line) {
						if (line.hasOwnProperty(k)) {
							values.push(k + ' = ' + line[k])
						}
					}
					line = '{' + values.join(', ') + '}'
				}
				line = line.toString()
				switch (line.substring(0, line.search(/[\s\(]/))) {
					case 'if':
					case 'do':
					case 'let':
					case 'for':
					case 'var':
					case 'with':
					case 'while': break
					default: line = (i < last ? 'var ' + λ.uppercaseLetters[i] + ' = ' : 'return ') + line
				}
				lines.push(header + line)
			}
		}
		if (λ.DEBUG) {
			lines.push('try {')
			addLines(arguments, '\t')
			lines.push('} catch(e) {')
			lines.push('\talert("func error: " + e + ", stack: " + (new Error()).stack)')
			lines.push('}')
		} else {
			addLines(arguments, '')
		}
		var joined = lines.join('\n'),
			result = new Function('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', joined)
		//result.toString = 'function(a, b, c, d, e, f, g, h) {' + lines + '}'
		return result
	} catch(e) {
		alert(e + ':\n' + lines.join('\n') + '\nstack:\n\n' + (new Error()).stack)
	}
}

λ.DEBUG = false

Λ = function(comments) {
	return λ
}

λ.lowercaseLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
	'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

λ.uppercaseLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
	'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

λ.letters = λ.lowercaseLetters.concat(λ.uppercaseLetters)

λ.k = function(o) {
	var k = 'k'
	if (o instanceof Array) {
		k = o[1] || k
		o = o[0]
	}
	var exprs = Array.prototype.slice.call(arguments, 1).join('; ')
	return ['for (var ', k, ' in ', o, ') if (', o, '.hasOwnProperty(', k, ')) {', exprs, '}'].join('')
}

λ.kv = function(o) {
	var k = 'k',
		v = 'v'
	if (o instanceof Array) {
		v = o[2] || v
		k = o[1] || k
		o = o[0]
	}
	var args = Array.prototype.slice.call(arguments, 1)
	args.unshift([o, k], 'var ' + v + ' = ' + o + '[' + k + ']')
	return λ.k.apply(null, args)
}

λ.i = function(a) {
	var i = 'i'
	if (a instanceof Array) {
		i = a[1] || i
		a = a[0]
	}
	var exprs = Array.prototype.slice.call(arguments, 1).join('; ')
	return ['for (var ', i, ' = 0, l = ', a, '.length; ', i, ' < l; ++', i, ') {', exprs, '}'].join('')
}

λ.iv = function(a) {
	var i = 'i',
		v = 'v'
	if (a instanceof Array) {
		i = a[1] || i
		a = a[0]
	}
	var args = Array.prototype.slice.call(arguments, 1)
	args.unshift([a, i], 'var ' + v + ' = ' + a + '[' + i + ']')
	return λ.i.apply(null, args)
}

λ.fi = function(expr, onTrue, onFalse) {
	return 'if (' + expr + ') {' + onTrue + '}' + (onFalse ? (' else {' + onFalse + '}') : '')
}

λ.K = function(o) {
	var k = 'k'
	if (o instanceof Array) {
		k = o[1] || k
		o = o[0]
	}
	var args = Array.prototype.slice.call(arguments, 0)
	args[0] = [o, k]
	return λ.fi(o + ' instanceof Array', λ.i.apply(null, args), λ.k.apply(null, args))
}

λ.KV = function(o) {
	var k = 'k',
		v = 'v'
	if (o instanceof Array) {
		v = o[2] || v
		k = o[1] || k
		o = o[0]
	}
	var args = Array.prototype.slice.call(arguments, 0)
	args[0] = [o, k, v]
	return λ.fi(o + ' instanceof Array', λ.iv.apply(null, args), λ.kv.apply(null, args))
}

λ.r = function(expr) {
	return 'return ' + expr
}

λ.args = function(begin) {
	return 'Array.prototype.slice.call(arguments, ' + (begin ? begin : 0) + ')'
}

λ.each = λ(λ.KV('a', 'b(v, k)'), 'a')

λ.placeholders = {}

λ.placeholder = function(value) {
	var result = function() {
		return value + '(' + Array.prototype.slice.call(arguments).join(', ') + ')'
	}
	result.at = function(key) {
		return value + '[' + key + ']'
	}
	result.set = function(key, val) {
		return value + '[' + key + '] = ' + val
	}
	result.toString = function() {return value}
	result.addPlaceholder = function(name) {
		return result[name] = λ.placeholder(value + '.' + name)
	}
	return result
}

λ.addPlaceholder = function(name, value) {
	var result = λ.placeholders[name] = λ.placeholder(value)
	;['apply', 'call', 'push', 'map'].forEach(result.addPlaceholder)
	return result
}

;[	['nil', 'null'],
	['that', 'this'],
	['args', 'arguments']].
	concat(λ.letters.map(λ('[a, a]'))).
	forEach(λ('λ.addPlaceholder(a[0], a[1])'))

λ.localPlaceholders = function(prefix) {
	prefix = prefix || ''
	var vars = []
	λ.each(λ.placeholders, function(v, k) {
		vars.push(header + k + ' = λ.placeholders.' + k)
	})
	return 'var ' + vars.join(', ')
}

// eval(λ.localPlaceholders('λ'))
