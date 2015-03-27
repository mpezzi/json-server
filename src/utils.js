var _ = require('underscore')
var _inflections = require('underscore.inflections')
_.mixin(_inflections)

// Turns string to native.
// Example:
//   'true' -> true
//   '1' -> 1
function toNative(value) {
  if (typeof value === 'string') {
    if (value === '' || value.trim() !== value) {
      return value
    } else if (value === 'true' || value === 'false') {
      return value === 'true'
    } else if (!isNaN(+value)) {
      return +value
    }
  }
  return value
}

module.exports = {
  toNative: toNative
}