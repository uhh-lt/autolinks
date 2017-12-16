'use strict';

module.exports = Offset;

Offset.prototype.from = 0;
Offset.prototype.length = 0;

/**
 * @constructor
 */
function Offset(from, length) {

  if(from) {
    this.from = from;
  }
  if(length) {
    this.length = length;
  }

}

Offset.prototype.end = function() {
  return this.from + this.length;
}

Offset.prototype.getText = function (text) {
  return text.substring(this.from, this.end());
}
