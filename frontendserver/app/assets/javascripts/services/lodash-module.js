/*
 * Copyright (C) 2017, Language Technology Group, Universität Hamburg, Germany
 *
 */

define([
	'angular',
	'lodash',
], function (angular) {
  	'use strict';

	angular.module('lodash', []).factory('_', function() {
	    return window._;
	});
});
