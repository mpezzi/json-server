var assert = require('assert')
var utils  = require('../src/utils')

describe('utils', function() {

  describe('toNative', function() {

    it('should convert string to native type', function() {
      // should convert
      assert.strictEqual(utils.toNative('1'), 1)
      assert.strictEqual(utils.toNative('true'), true)
      // should not convert
      assert.strictEqual(utils.toNative(''), '')
      assert.strictEqual(utils.toNative('\t\n'), '\t\n')
      assert.strictEqual(utils.toNative('1 '), '1 ')
      assert.strictEqual(utils.toNative(' 1'), ' 1')
      assert.strictEqual(utils.toNative('string'), 'string')
      assert.strictEqual(utils.toNative(1), 1)
      assert.strictEqual(utils.toNative(true), true)
    })

  })
})