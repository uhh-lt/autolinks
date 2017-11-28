(function (requirejs) {
    'use strict';

	requirejs.config({
		packages: ['libs'],
		baseUrl: './assets/javascripts',
		paths: {
			'angular': 'libs/angular/angular.min',
			'jquery': 'libs/jquery/dist/jquery.min',
			'jquery-json': 'libs/jquery-json/dist/jquery.json.min',
			'ngAnimate': 'libs/angular-animate/angular-animate',
			'ngAria': 'libs/angular-aria/angular-aria',
			'ngMaterial': 'libs/angular-material/angular-material.min',
			'bootstrap': 'libs/bootstrap/dist/js/bootstrap.min',
			'ui-bootstrap': 'libs/angular-bootstrap/ui-bootstrap-tpls.min',
			'ui-layout': 'libs/angular-ui-layout/src/ui-layout',
			'ui-router': 'libs/angular-ui-router/release/angular-ui-router.min',
			'underscore': 'libs/underscore/underscore-min',
			'vis': 'libs/vis/dist/vis.min',
			'ngVis': 'directives/angular-vis',
      'cytoscape': 'libs/cytoscape/dist/cytoscape.min',
      'ngCyt':'directives/cytoscapeDirective',
      'ngMagnify': 'libs/ng-magnify/src/js/ng-magnify'
		},
		shim: {
			'jquery': {
				exports: 'JQuery'
			},
			'ui-layout': {
				exports: 'angular',
				deps: ['angular', 'ngAnimate']
			},
			'angular': {
				exports: 'angular',
				deps: ['jquery']
			},
			'ngAnimate': {
				exports: 'angular',
				deps: ['angular']
			},
			'ngAria': {
				exports: 'angular',
				deps: ['angular']
			},
			'bootstrap': {
				deps: ['jquery']
			},
			'ui-bootstrap': {
				deps: ['angular', 'bootstrap', 'ngAnimate']
			},
			'ui-router': {
				exports: 'angular',
				deps: ['angular']
			},
			'ngMaterial': {
				deps: ['angular', 'ngAria', 'ngAnimate']
			},
			'underscore': {
				exports: '_'
			},
			'ngVis': {
				deps: ['angular', 'vis']
			},
      'ngCyt': {
        deps: ['angular', 'cytoscape']
      },
      'ngMagnify': {
        deps: ['angular']
      }
		},
		priority: [
			'jquery',
			'angular',
		],
		deps: ['angular','jquery'],
		waitSeconds: 5
	});

	requirejs.onError = function (err) {
		console.log(err);
	};

	require([
			'angular',
			'app'
		], function(angular, app) {
			angular.bootstrap(document, ['autolinks']);
		}
	);
})(requirejs);
