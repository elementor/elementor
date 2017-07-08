/*! elementor - v1.5.0 - 02-07-2017 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Module = require( 'elementor-utils/module' ),
	PreviewModule;

PreviewModule = Module.extend( {
	dialogsManager: null,

	onInit: function() {
		this.dialogsManager = new DialogsManager.Instance();
	}
} );

module.exports = window.elementorPreview = new PreviewModule();

},{"elementor-utils/module":2}],2:[function(require,module,exports){
var Module = function() {
	var $ = jQuery,
		instanceParams = arguments,
		self = this,
		settings,
		events = {};

	var ensureClosureMethods = function() {
		$.each( self, function( methodName ) {
			var oldMethod = self[ methodName ];

			if ( 'function' !== typeof oldMethod ) {
				return;
			}

			self[ methodName ] = function() {
				return oldMethod.apply( self, arguments );
			};
		});
	};

	var initSettings = function() {
		settings = self.getDefaultSettings();

		var instanceSettings = instanceParams[0];

		if ( instanceSettings ) {
			$.extend( settings, instanceSettings );
		}
	};

	var init = function() {
		self.__construct.apply( self, instanceParams );

		ensureClosureMethods();

		initSettings();

		self.trigger( 'init' );
	};

	this.getItems = function( items, itemKey ) {
		if ( itemKey ) {
			var keyStack = itemKey.split( '.' ),
				currentKey = keyStack.splice( 0, 1 );

			if ( ! keyStack.length ) {
				return items[ currentKey ];
			}

			if ( ! items[ currentKey ] ) {
				return;
			}

			return this.getItems(  items[ currentKey ], keyStack.join( '.' ) );
		}

		return items;
	};

	this.getSettings = function( setting ) {
		return this.getItems( settings, setting );
	};

	this.setSettings = function( settingKey, value, settingsContainer ) {
		if ( ! settingsContainer ) {
			settingsContainer = settings;
		}

		if ( 'object' === typeof settingKey ) {
			$.extend( settingsContainer, settingKey );

			return self;
		}

		var keyStack = settingKey.split( '.' ),
			currentKey = keyStack.splice( 0, 1 );

		if ( ! keyStack.length ) {
			settingsContainer[ currentKey ] = value;

			return self;
		}

		if ( ! settingsContainer[ currentKey ] ) {
			settingsContainer[ currentKey ] = {};
		}

		return self.setSettings( keyStack.join( '.' ), value, settingsContainer[ currentKey ] );
	};

	this.on = function( eventName, callback ) {
		if ( ! events[ eventName ] ) {
			events[ eventName ] = [];
		}

		events[ eventName ].push( callback );

		return self;
	};

	this.off = function( eventName, callback ) {
		if ( ! events[ eventName ] ) {
			return self;
		}

		if ( ! callback ) {
			delete events[ eventName ];

			return self;
		}

		var callbackIndex = events[ eventName ].indexOf( callback );

		if ( -1 !== callbackIndex ) {
			delete events[ eventName ][ callbackIndex ];
		}

		return self;
	};

	this.trigger = function( eventName ) {
		var methodName = 'on' + eventName[ 0 ].toUpperCase() + eventName.slice( 1 ),
			params = Array.prototype.slice.call( arguments, 1 );

		if ( self[ methodName ] ) {
			self[ methodName ].apply( self, params );
		}

		var callbacks = events[ eventName ];

		if ( ! callbacks ) {
			return;
		}

		$.each( callbacks, function( index, callback ) {
			callback.apply( self, params );
		} );
	};

	init();
};

Module.prototype.__construct = function() {};

Module.prototype.getDefaultSettings = function() {
	return {};
};

Module.extendsCount = 0;

Module.extend = function( properties ) {
	var $ = jQuery,
		parent = this;

	var child = function() {
		return parent.apply( this, arguments );
	};

	$.extend( child, parent );

	child.prototype = Object.create( $.extend( {}, parent.prototype, properties ) );

	child.prototype.constructor = child;

	/*
	 * Constructor ID is used to set an unique ID
     * to every extend of the Module.
     *
	 * It's useful in some cases such as unique
	 * listener for frontend handlers.
	 */
	var constructorID = ++Module.extendsCount;

	child.prototype.getConstructorID = function() {
		return constructorID;
	};

	child.__super__ = parent.prototype;

	return child;
};

module.exports = Module;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvZGV2L2pzL3ByZXZpZXcvcHJldmlldy5qcyIsImFzc2V0cy9kZXYvanMvdXRpbHMvbW9kdWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgTW9kdWxlID0gcmVxdWlyZSggJ2VsZW1lbnRvci11dGlscy9tb2R1bGUnICksXG5cdFByZXZpZXdNb2R1bGU7XG5cblByZXZpZXdNb2R1bGUgPSBNb2R1bGUuZXh0ZW5kKCB7XG5cdGRpYWxvZ3NNYW5hZ2VyOiBudWxsLFxuXG5cdG9uSW5pdDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5kaWFsb2dzTWFuYWdlciA9IG5ldyBEaWFsb2dzTWFuYWdlci5JbnN0YW5jZSgpO1xuXHR9XG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gd2luZG93LmVsZW1lbnRvclByZXZpZXcgPSBuZXcgUHJldmlld01vZHVsZSgpO1xuIiwidmFyIE1vZHVsZSA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgJCA9IGpRdWVyeSxcblx0XHRpbnN0YW5jZVBhcmFtcyA9IGFyZ3VtZW50cyxcblx0XHRzZWxmID0gdGhpcyxcblx0XHRzZXR0aW5ncyxcblx0XHRldmVudHMgPSB7fTtcblxuXHR2YXIgZW5zdXJlQ2xvc3VyZU1ldGhvZHMgPSBmdW5jdGlvbigpIHtcblx0XHQkLmVhY2goIHNlbGYsIGZ1bmN0aW9uKCBtZXRob2ROYW1lICkge1xuXHRcdFx0dmFyIG9sZE1ldGhvZCA9IHNlbGZbIG1ldGhvZE5hbWUgXTtcblxuXHRcdFx0aWYgKCAnZnVuY3Rpb24nICE9PSB0eXBlb2Ygb2xkTWV0aG9kICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHNlbGZbIG1ldGhvZE5hbWUgXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gb2xkTWV0aG9kLmFwcGx5KCBzZWxmLCBhcmd1bWVudHMgKTtcblx0XHRcdH07XG5cdFx0fSk7XG5cdH07XG5cblx0dmFyIGluaXRTZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xuXHRcdHNldHRpbmdzID0gc2VsZi5nZXREZWZhdWx0U2V0dGluZ3MoKTtcblxuXHRcdHZhciBpbnN0YW5jZVNldHRpbmdzID0gaW5zdGFuY2VQYXJhbXNbMF07XG5cblx0XHRpZiAoIGluc3RhbmNlU2V0dGluZ3MgKSB7XG5cdFx0XHQkLmV4dGVuZCggc2V0dGluZ3MsIGluc3RhbmNlU2V0dGluZ3MgKTtcblx0XHR9XG5cdH07XG5cblx0dmFyIGluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRzZWxmLl9fY29uc3RydWN0LmFwcGx5KCBzZWxmLCBpbnN0YW5jZVBhcmFtcyApO1xuXG5cdFx0ZW5zdXJlQ2xvc3VyZU1ldGhvZHMoKTtcblxuXHRcdGluaXRTZXR0aW5ncygpO1xuXG5cdFx0c2VsZi50cmlnZ2VyKCAnaW5pdCcgKTtcblx0fTtcblxuXHR0aGlzLmdldEl0ZW1zID0gZnVuY3Rpb24oIGl0ZW1zLCBpdGVtS2V5ICkge1xuXHRcdGlmICggaXRlbUtleSApIHtcblx0XHRcdHZhciBrZXlTdGFjayA9IGl0ZW1LZXkuc3BsaXQoICcuJyApLFxuXHRcdFx0XHRjdXJyZW50S2V5ID0ga2V5U3RhY2suc3BsaWNlKCAwLCAxICk7XG5cblx0XHRcdGlmICggISBrZXlTdGFjay5sZW5ndGggKSB7XG5cdFx0XHRcdHJldHVybiBpdGVtc1sgY3VycmVudEtleSBdO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoICEgaXRlbXNbIGN1cnJlbnRLZXkgXSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRJdGVtcyggIGl0ZW1zWyBjdXJyZW50S2V5IF0sIGtleVN0YWNrLmpvaW4oICcuJyApICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGl0ZW1zO1xuXHR9O1xuXG5cdHRoaXMuZ2V0U2V0dGluZ3MgPSBmdW5jdGlvbiggc2V0dGluZyApIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRJdGVtcyggc2V0dGluZ3MsIHNldHRpbmcgKTtcblx0fTtcblxuXHR0aGlzLnNldFNldHRpbmdzID0gZnVuY3Rpb24oIHNldHRpbmdLZXksIHZhbHVlLCBzZXR0aW5nc0NvbnRhaW5lciApIHtcblx0XHRpZiAoICEgc2V0dGluZ3NDb250YWluZXIgKSB7XG5cdFx0XHRzZXR0aW5nc0NvbnRhaW5lciA9IHNldHRpbmdzO1xuXHRcdH1cblxuXHRcdGlmICggJ29iamVjdCcgPT09IHR5cGVvZiBzZXR0aW5nS2V5ICkge1xuXHRcdFx0JC5leHRlbmQoIHNldHRpbmdzQ29udGFpbmVyLCBzZXR0aW5nS2V5ICk7XG5cblx0XHRcdHJldHVybiBzZWxmO1xuXHRcdH1cblxuXHRcdHZhciBrZXlTdGFjayA9IHNldHRpbmdLZXkuc3BsaXQoICcuJyApLFxuXHRcdFx0Y3VycmVudEtleSA9IGtleVN0YWNrLnNwbGljZSggMCwgMSApO1xuXG5cdFx0aWYgKCAhIGtleVN0YWNrLmxlbmd0aCApIHtcblx0XHRcdHNldHRpbmdzQ29udGFpbmVyWyBjdXJyZW50S2V5IF0gPSB2YWx1ZTtcblxuXHRcdFx0cmV0dXJuIHNlbGY7XG5cdFx0fVxuXG5cdFx0aWYgKCAhIHNldHRpbmdzQ29udGFpbmVyWyBjdXJyZW50S2V5IF0gKSB7XG5cdFx0XHRzZXR0aW5nc0NvbnRhaW5lclsgY3VycmVudEtleSBdID0ge307XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNlbGYuc2V0U2V0dGluZ3MoIGtleVN0YWNrLmpvaW4oICcuJyApLCB2YWx1ZSwgc2V0dGluZ3NDb250YWluZXJbIGN1cnJlbnRLZXkgXSApO1xuXHR9O1xuXG5cdHRoaXMub24gPSBmdW5jdGlvbiggZXZlbnROYW1lLCBjYWxsYmFjayApIHtcblx0XHRpZiAoICEgZXZlbnRzWyBldmVudE5hbWUgXSApIHtcblx0XHRcdGV2ZW50c1sgZXZlbnROYW1lIF0gPSBbXTtcblx0XHR9XG5cblx0XHRldmVudHNbIGV2ZW50TmFtZSBdLnB1c2goIGNhbGxiYWNrICk7XG5cblx0XHRyZXR1cm4gc2VsZjtcblx0fTtcblxuXHR0aGlzLm9mZiA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGNhbGxiYWNrICkge1xuXHRcdGlmICggISBldmVudHNbIGV2ZW50TmFtZSBdICkge1xuXHRcdFx0cmV0dXJuIHNlbGY7XG5cdFx0fVxuXG5cdFx0aWYgKCAhIGNhbGxiYWNrICkge1xuXHRcdFx0ZGVsZXRlIGV2ZW50c1sgZXZlbnROYW1lIF07XG5cblx0XHRcdHJldHVybiBzZWxmO1xuXHRcdH1cblxuXHRcdHZhciBjYWxsYmFja0luZGV4ID0gZXZlbnRzWyBldmVudE5hbWUgXS5pbmRleE9mKCBjYWxsYmFjayApO1xuXG5cdFx0aWYgKCAtMSAhPT0gY2FsbGJhY2tJbmRleCApIHtcblx0XHRcdGRlbGV0ZSBldmVudHNbIGV2ZW50TmFtZSBdWyBjYWxsYmFja0luZGV4IF07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNlbGY7XG5cdH07XG5cblx0dGhpcy50cmlnZ2VyID0gZnVuY3Rpb24oIGV2ZW50TmFtZSApIHtcblx0XHR2YXIgbWV0aG9kTmFtZSA9ICdvbicgKyBldmVudE5hbWVbIDAgXS50b1VwcGVyQ2FzZSgpICsgZXZlbnROYW1lLnNsaWNlKCAxICksXG5cdFx0XHRwYXJhbXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCggYXJndW1lbnRzLCAxICk7XG5cblx0XHRpZiAoIHNlbGZbIG1ldGhvZE5hbWUgXSApIHtcblx0XHRcdHNlbGZbIG1ldGhvZE5hbWUgXS5hcHBseSggc2VsZiwgcGFyYW1zICk7XG5cdFx0fVxuXG5cdFx0dmFyIGNhbGxiYWNrcyA9IGV2ZW50c1sgZXZlbnROYW1lIF07XG5cblx0XHRpZiAoICEgY2FsbGJhY2tzICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdCQuZWFjaCggY2FsbGJhY2tzLCBmdW5jdGlvbiggaW5kZXgsIGNhbGxiYWNrICkge1xuXHRcdFx0Y2FsbGJhY2suYXBwbHkoIHNlbGYsIHBhcmFtcyApO1xuXHRcdH0gKTtcblx0fTtcblxuXHRpbml0KCk7XG59O1xuXG5Nb2R1bGUucHJvdG90eXBlLl9fY29uc3RydWN0ID0gZnVuY3Rpb24oKSB7fTtcblxuTW9kdWxlLnByb3RvdHlwZS5nZXREZWZhdWx0U2V0dGluZ3MgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHt9O1xufTtcblxuTW9kdWxlLmV4dGVuZHNDb3VudCA9IDA7XG5cbk1vZHVsZS5leHRlbmQgPSBmdW5jdGlvbiggcHJvcGVydGllcyApIHtcblx0dmFyICQgPSBqUXVlcnksXG5cdFx0cGFyZW50ID0gdGhpcztcblxuXHR2YXIgY2hpbGQgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gcGFyZW50LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fTtcblxuXHQkLmV4dGVuZCggY2hpbGQsIHBhcmVudCApO1xuXG5cdGNoaWxkLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoICQuZXh0ZW5kKCB7fSwgcGFyZW50LnByb3RvdHlwZSwgcHJvcGVydGllcyApICk7XG5cblx0Y2hpbGQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY2hpbGQ7XG5cblx0Lypcblx0ICogQ29uc3RydWN0b3IgSUQgaXMgdXNlZCB0byBzZXQgYW4gdW5pcXVlIElEXG4gICAgICogdG8gZXZlcnkgZXh0ZW5kIG9mIHRoZSBNb2R1bGUuXG4gICAgICpcblx0ICogSXQncyB1c2VmdWwgaW4gc29tZSBjYXNlcyBzdWNoIGFzIHVuaXF1ZVxuXHQgKiBsaXN0ZW5lciBmb3IgZnJvbnRlbmQgaGFuZGxlcnMuXG5cdCAqL1xuXHR2YXIgY29uc3RydWN0b3JJRCA9ICsrTW9kdWxlLmV4dGVuZHNDb3VudDtcblxuXHRjaGlsZC5wcm90b3R5cGUuZ2V0Q29uc3RydWN0b3JJRCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBjb25zdHJ1Y3RvcklEO1xuXHR9O1xuXG5cdGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7XG5cblx0cmV0dXJuIGNoaWxkO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2R1bGU7XG4iXX0=
