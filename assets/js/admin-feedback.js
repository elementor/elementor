(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global jQuery, ElementorAdminFeedbackArgs */
( function( $ ) {
	'use strict';

	var ElementorAdminDialogApp = {

		dialogsManager: new DialogsManager.Instance(),

		cacheElements: function() {
			this.cache = {
				$deactivateLink: $( '#the-list' ).find( '[data-slug="elementor"] span.deactivate a' ),
				$dialogHeader: $( '#elementor-deactivate-feedback-dialog-header' ),
				$dialogForm: $( '#elementor-deactivate-feedback-dialog-form' )
			};
		},

		bindEvents: function() {
			var self = this;

			self.cache.$deactivateLink.on( 'click', function( event ) {
				event.preventDefault();

				self.getModal().show();
			} );
		},

		deactivate: function() {
			location.href = this.cache.$deactivateLink.attr( 'href' );
		},

		initModal: function() {
			var self = this,
				modal;

			self.getModal = function() {
				if ( ! modal ) {
					modal = self.dialogsManager.createWidget( 'options', {
						id: 'elementor-deactivate-feedback-modal',
						headerMessage: self.cache.$dialogHeader,
						message: self.cache.$dialogForm,
						hide: {
							onButtonClick: false
						},
						position: {
							my: 'center',
							at: 'center'
						},
						onReady: function() {
							DialogsManager.getWidgetType( 'options' ).prototype.onReady.apply( this, arguments );

							this.addButton( {
								name: 'submit',
								text: ElementorAdminFeedbackArgs.i18n.submit_n_deactivate,
								callback: _.bind( self.sendFeedback, self )
							} );

							if ( ! ElementorAdminFeedbackArgs.is_tracker_opted_in ) {
								this.addButton( {
									name: 'skip',
									text: ElementorAdminFeedbackArgs.i18n.skip_n_deactivate,
									callback: function() {
										self.deactivate();
									}
								} );
							}
						}
					} );
				}

				return modal;
			};
		},

		sendFeedback: function() {
			var self = this,
				formData = self.cache.$dialogForm.serialize();

			self.getModal().getElements( 'submit' ).text( '' ).addClass( 'elementor-loading' );

			$.post( ajaxurl, formData, _.bind( this.deactivate, this ) );
		},

		init: function() {
			this.initModal();
			this.cacheElements();
			this.bindEvents();
		}
	};

	$( function() {
		ElementorAdminDialogApp.init();
	} );

}( jQuery ) );

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvZGV2L2pzL2FkbWluL2FkbWluLWZlZWRiYWNrLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBnbG9iYWwgalF1ZXJ5LCBFbGVtZW50b3JBZG1pbkZlZWRiYWNrQXJncyAqL1xuKCBmdW5jdGlvbiggJCApIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBFbGVtZW50b3JBZG1pbkRpYWxvZ0FwcCA9IHtcblxuXHRcdGRpYWxvZ3NNYW5hZ2VyOiBuZXcgRGlhbG9nc01hbmFnZXIuSW5zdGFuY2UoKSxcblxuXHRcdGNhY2hlRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5jYWNoZSA9IHtcblx0XHRcdFx0JGRlYWN0aXZhdGVMaW5rOiAkKCAnI3RoZS1saXN0JyApLmZpbmQoICdbZGF0YS1zbHVnPVwiZWxlbWVudG9yXCJdIHNwYW4uZGVhY3RpdmF0ZSBhJyApLFxuXHRcdFx0XHQkZGlhbG9nSGVhZGVyOiAkKCAnI2VsZW1lbnRvci1kZWFjdGl2YXRlLWZlZWRiYWNrLWRpYWxvZy1oZWFkZXInICksXG5cdFx0XHRcdCRkaWFsb2dGb3JtOiAkKCAnI2VsZW1lbnRvci1kZWFjdGl2YXRlLWZlZWRiYWNrLWRpYWxvZy1mb3JtJyApXG5cdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRiaW5kRXZlbnRzOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdFx0c2VsZi5jYWNoZS4kZGVhY3RpdmF0ZUxpbmsub24oICdjbGljaycsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0XHRzZWxmLmdldE1vZGFsKCkuc2hvdygpO1xuXHRcdFx0fSApO1xuXHRcdH0sXG5cblx0XHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHRcdGxvY2F0aW9uLmhyZWYgPSB0aGlzLmNhY2hlLiRkZWFjdGl2YXRlTGluay5hdHRyKCAnaHJlZicgKTtcblx0XHR9LFxuXG5cdFx0aW5pdE1vZGFsOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdFx0bW9kYWw7XG5cblx0XHRcdHNlbGYuZ2V0TW9kYWwgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKCAhIG1vZGFsICkge1xuXHRcdFx0XHRcdG1vZGFsID0gc2VsZi5kaWFsb2dzTWFuYWdlci5jcmVhdGVXaWRnZXQoICdvcHRpb25zJywge1xuXHRcdFx0XHRcdFx0aWQ6ICdlbGVtZW50b3ItZGVhY3RpdmF0ZS1mZWVkYmFjay1tb2RhbCcsXG5cdFx0XHRcdFx0XHRoZWFkZXJNZXNzYWdlOiBzZWxmLmNhY2hlLiRkaWFsb2dIZWFkZXIsXG5cdFx0XHRcdFx0XHRtZXNzYWdlOiBzZWxmLmNhY2hlLiRkaWFsb2dGb3JtLFxuXHRcdFx0XHRcdFx0aGlkZToge1xuXHRcdFx0XHRcdFx0XHRvbkJ1dHRvbkNsaWNrOiBmYWxzZVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0XHRcdG15OiAnY2VudGVyJyxcblx0XHRcdFx0XHRcdFx0YXQ6ICdjZW50ZXInXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0b25SZWFkeTogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdERpYWxvZ3NNYW5hZ2VyLmdldFdpZGdldFR5cGUoICdvcHRpb25zJyApLnByb3RvdHlwZS5vblJlYWR5LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdFx0XHRcdFx0XHR0aGlzLmFkZEJ1dHRvbigge1xuXHRcdFx0XHRcdFx0XHRcdG5hbWU6ICdzdWJtaXQnLFxuXHRcdFx0XHRcdFx0XHRcdHRleHQ6IEVsZW1lbnRvckFkbWluRmVlZGJhY2tBcmdzLmkxOG4uc3VibWl0X25fZGVhY3RpdmF0ZSxcblx0XHRcdFx0XHRcdFx0XHRjYWxsYmFjazogXy5iaW5kKCBzZWxmLnNlbmRGZWVkYmFjaywgc2VsZiApXG5cdFx0XHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoICEgRWxlbWVudG9yQWRtaW5GZWVkYmFja0FyZ3MuaXNfdHJhY2tlcl9vcHRlZF9pbiApIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLmFkZEJ1dHRvbigge1xuXHRcdFx0XHRcdFx0XHRcdFx0bmFtZTogJ3NraXAnLFxuXHRcdFx0XHRcdFx0XHRcdFx0dGV4dDogRWxlbWVudG9yQWRtaW5GZWVkYmFja0FyZ3MuaTE4bi5za2lwX25fZGVhY3RpdmF0ZSxcblx0XHRcdFx0XHRcdFx0XHRcdGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0c2VsZi5kZWFjdGl2YXRlKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSApO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG1vZGFsO1xuXHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0c2VuZEZlZWRiYWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdFx0Zm9ybURhdGEgPSBzZWxmLmNhY2hlLiRkaWFsb2dGb3JtLnNlcmlhbGl6ZSgpO1xuXG5cdFx0XHRzZWxmLmdldE1vZGFsKCkuZ2V0RWxlbWVudHMoICdzdWJtaXQnICkudGV4dCggJycgKS5hZGRDbGFzcyggJ2VsZW1lbnRvci1sb2FkaW5nJyApO1xuXG5cdFx0XHQkLnBvc3QoIGFqYXh1cmwsIGZvcm1EYXRhLCBfLmJpbmQoIHRoaXMuZGVhY3RpdmF0ZSwgdGhpcyApICk7XG5cdFx0fSxcblxuXHRcdGluaXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5pbml0TW9kYWwoKTtcblx0XHRcdHRoaXMuY2FjaGVFbGVtZW50cygpO1xuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKCk7XG5cdFx0fVxuXHR9O1xuXG5cdCQoIGZ1bmN0aW9uKCkge1xuXHRcdEVsZW1lbnRvckFkbWluRGlhbG9nQXBwLmluaXQoKTtcblx0fSApO1xuXG59KCBqUXVlcnkgKSApO1xuIl19
