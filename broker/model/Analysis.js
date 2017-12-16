'use strict';

module.exports = Analysis;

Analysis.prototype.text = '';
Analysis.prototype.source = 'unk';
Analysis.prototype.lang = 'en';
Analysis.prototype.availableTypes = [];
Analysis.prototype.annotations = [];

/**
 * @constructor
 */
function Analysis() {
  /*
   * The analysis object
   */
  this.availableTypes = [ ];
  this.annotations = [ ];
}

