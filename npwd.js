#!/usr/bin/env node
'use strict';
var clipbd = require('copy-paste')
var scrypt = require('scrypt-async')
var prompt = require('prompt')
var colors = require('colors')

var stdout = process.stdout
process.on('SIGINT', process.exit)

var npwd = {
	scrypt: function(res, cbk) {
		var n = 'npwd'
		return scrypt(
			res.key,n+res.acc+n,
			17,8,16,800,cbk,'hex'
		)
	},
	prompt: function(cbk) {
		prompt.message = 'npwd'.blue
		prompt.delimiter = '>'
		prompt.start()
		prompt.get({properties: {
			key: {
				hidden: true,
				message: 'key',
				required: true
			},
			acc: {
				hidden: false,
				message: 'account',
				required: true
			}
		}}, cbk)
	},
	inClipbd: function(c, cbk) {
		stdout.clearLine()
		stdout.cursorTo(0)
		stdout.write(npwd.msg[0] + c)
		setTimeout(function() {
			c? npwd.inClipbd(--c, cbk)
			:  clipbd.copy('', cbk)
		}, 1000)
	},
	clear: function() {
		stdout.clearLine()
		stdout.cursorTo(0)
		process.exit()
	},
	msg: [
		'In clipboard!'.bgGreen + ' '
	]
}

npwd.prompt(function(err, res) {
	var l = [1, 0x7c, 0x2f, 0x2014, 0x5c]
	var t = setInterval(function() {
		(l[0] == 5)? l[0] = 1 : 0
		stdout.clearLine()
		stdout.cursorTo(0)
		stdout.write(String.fromCharCode(
			l[l[0]++]
		))
	}, 83)
	res.acc = res.acc.toLowerCase()
	npwd.scrypt(res, function(pwd) {
		clipbd.copy(pwd, function() {
			clearInterval(t)
			npwd.inClipbd(15, npwd.clear)
		})
	})
})
