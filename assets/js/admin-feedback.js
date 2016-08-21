(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global jQuery, ElementorAdminFeedbackArgs */
( function( $ ) {
	'use strict';

	var ElementorAdminDialogApp = {

		elementorModals: require( 'elementor-utils/modals' ),

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
					modal = self.dialogsManager.createWidget( 'elementor-modal', {
						id: 'elementor-deactivate-feedback-modal',
						headerMessage: self.cache.$dialogHeader,
						message: self.cache.$dialogForm,
						hideOnButtonClick: false,
						onReady: function() {
							DialogsManager.getWidgetType( 'elementor-modal' ).prototype.onReady.apply( this, arguments );

							this.addButton( {
								name: 'submit',
								text: ElementorAdminFeedbackArgs.i18n.submit_n_deactivate,
								callback: _.bind( self.sendFeedback, self )
							} );

							this.addButton( {
								name: 'skip',
								text: ElementorAdminFeedbackArgs.i18n.skip_n_deactivate,
								callback: function() {
									self.deactivate();
								}
							} );
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
			this.elementorModals.init();
			this.initModal();
			this.cacheElements();
			this.bindEvents();
		}
	};

	$( function() {
		ElementorAdminDialogApp.init();
	} );

}( jQuery ) );

},{"elementor-utils/modals":2}],2:[function(require,module,exports){
var Modals;

Modals = {
	init: function() {
		this.initModalWidgetType();
	},

	initModalWidgetType: function() {
		var modalProperties = {
			getDefaultSettings: function() {
				var settings = DialogsManager.getWidgetType( 'options' ).prototype.getDefaultSettings.apply( this, arguments );

				return _.extend( settings, {
					position: {
						my: 'center',
						at: 'center'
					},
					contentWidth: 'auto',
					contentHeight: 'auto',
					closeButton: true
				} );
			},
			buildWidget: function() {
				DialogsManager.getWidgetType( 'options' ).prototype.buildWidget.apply( this, arguments );

				if ( ! this.getSettings( 'closeButton' ) ) {
					return;
				}

				var $closeButton = this.addElement( 'closeButton', '<div><i class="fa fa-times"></i></div>' );

				this.getElements( 'widgetContent' ).prepend( $closeButton );
			},
			attachEvents: function() {
				if ( this.getSettings( 'closeButton' ) ) {
					this.getElements( 'closeButton' ).on( 'click', this.hide );
				}
			},
			onReady: function() {
				DialogsManager.getWidgetType( 'options' ).prototype.onReady.apply( this, arguments );

				var elements = this.getElements(),
					settings = this.getSettings();

				if ( 'auto' !== settings.contentWidth ) {
					elements.message.width( settings.contentWidth );
				}

				if ( 'auto' !== settings.contentHeight ) {
					elements.message.height( settings.contentHeight );
				}
			}
		};

		DialogsManager.addWidgetType( 'elementor-modal', DialogsManager.getWidgetType( 'options' ).extend( 'elementor-modal', modalProperties ) );
	}
};

module.exports = Modals;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvZGV2L2pzL2FkbWluL2FkbWluLWZlZWRiYWNrLmpzIiwiYXNzZXRzL2Rldi9qcy9lZGl0b3IvdXRpbHMvbW9kYWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogZ2xvYmFsIGpRdWVyeSwgRWxlbWVudG9yQWRtaW5GZWVkYmFja0FyZ3MgKi9cbiggZnVuY3Rpb24oICQgKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgRWxlbWVudG9yQWRtaW5EaWFsb2dBcHAgPSB7XG5cblx0XHRlbGVtZW50b3JNb2RhbHM6IHJlcXVpcmUoICdlbGVtZW50b3ItdXRpbHMvbW9kYWxzJyApLFxuXG5cdFx0ZGlhbG9nc01hbmFnZXI6IG5ldyBEaWFsb2dzTWFuYWdlci5JbnN0YW5jZSgpLFxuXG5cdFx0Y2FjaGVFbGVtZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmNhY2hlID0ge1xuXHRcdFx0XHQkZGVhY3RpdmF0ZUxpbms6ICQoICcjdGhlLWxpc3QnICkuZmluZCggJ1tkYXRhLXNsdWc9XCJlbGVtZW50b3JcIl0gc3Bhbi5kZWFjdGl2YXRlIGEnICksXG5cdFx0XHRcdCRkaWFsb2dIZWFkZXI6ICQoICcjZWxlbWVudG9yLWRlYWN0aXZhdGUtZmVlZGJhY2stZGlhbG9nLWhlYWRlcicgKSxcblx0XHRcdFx0JGRpYWxvZ0Zvcm06ICQoICcjZWxlbWVudG9yLWRlYWN0aXZhdGUtZmVlZGJhY2stZGlhbG9nLWZvcm0nIClcblx0XHRcdH07XG5cdFx0fSxcblxuXHRcdGJpbmRFdmVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0XHRzZWxmLmNhY2hlLiRkZWFjdGl2YXRlTGluay5vbiggJ2NsaWNrJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRcdHNlbGYuZ2V0TW9kYWwoKS5zaG93KCk7XG5cdFx0XHR9ICk7XG5cdFx0fSxcblxuXHRcdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bG9jYXRpb24uaHJlZiA9IHRoaXMuY2FjaGUuJGRlYWN0aXZhdGVMaW5rLmF0dHIoICdocmVmJyApO1xuXHRcdH0sXG5cblx0XHRpbml0TW9kYWw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzLFxuXHRcdFx0XHRtb2RhbDtcblxuXHRcdFx0c2VsZi5nZXRNb2RhbCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoICEgbW9kYWwgKSB7XG5cdFx0XHRcdFx0bW9kYWwgPSBzZWxmLmRpYWxvZ3NNYW5hZ2VyLmNyZWF0ZVdpZGdldCggJ2VsZW1lbnRvci1tb2RhbCcsIHtcblx0XHRcdFx0XHRcdGlkOiAnZWxlbWVudG9yLWRlYWN0aXZhdGUtZmVlZGJhY2stbW9kYWwnLFxuXHRcdFx0XHRcdFx0aGVhZGVyTWVzc2FnZTogc2VsZi5jYWNoZS4kZGlhbG9nSGVhZGVyLFxuXHRcdFx0XHRcdFx0bWVzc2FnZTogc2VsZi5jYWNoZS4kZGlhbG9nRm9ybSxcblx0XHRcdFx0XHRcdGhpZGVPbkJ1dHRvbkNsaWNrOiBmYWxzZSxcblx0XHRcdFx0XHRcdG9uUmVhZHk6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHREaWFsb2dzTWFuYWdlci5nZXRXaWRnZXRUeXBlKCAnZWxlbWVudG9yLW1vZGFsJyApLnByb3RvdHlwZS5vblJlYWR5LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdFx0XHRcdFx0XHR0aGlzLmFkZEJ1dHRvbigge1xuXHRcdFx0XHRcdFx0XHRcdG5hbWU6ICdzdWJtaXQnLFxuXHRcdFx0XHRcdFx0XHRcdHRleHQ6IEVsZW1lbnRvckFkbWluRmVlZGJhY2tBcmdzLmkxOG4uc3VibWl0X25fZGVhY3RpdmF0ZSxcblx0XHRcdFx0XHRcdFx0XHRjYWxsYmFjazogXy5iaW5kKCBzZWxmLnNlbmRGZWVkYmFjaywgc2VsZiApXG5cdFx0XHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRcdFx0XHR0aGlzLmFkZEJ1dHRvbigge1xuXHRcdFx0XHRcdFx0XHRcdG5hbWU6ICdza2lwJyxcblx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBFbGVtZW50b3JBZG1pbkZlZWRiYWNrQXJncy5pMThuLnNraXBfbl9kZWFjdGl2YXRlLFxuXHRcdFx0XHRcdFx0XHRcdGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHNlbGYuZGVhY3RpdmF0ZSgpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBtb2RhbDtcblx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHNlbmRGZWVkYmFjazogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXMsXG5cdFx0XHRcdGZvcm1EYXRhID0gc2VsZi5jYWNoZS4kZGlhbG9nRm9ybS5zZXJpYWxpemUoKTtcblxuXHRcdFx0c2VsZi5nZXRNb2RhbCgpLmdldEVsZW1lbnRzKCAnc3VibWl0JyApLnRleHQoICcnICkuYWRkQ2xhc3MoICdlbGVtZW50b3ItbG9hZGluZycgKTtcblxuXHRcdFx0JC5wb3N0KCBhamF4dXJsLCBmb3JtRGF0YSwgXy5iaW5kKCB0aGlzLmRlYWN0aXZhdGUsIHRoaXMgKSApO1xuXHRcdH0sXG5cblx0XHRpbml0OiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuZWxlbWVudG9yTW9kYWxzLmluaXQoKTtcblx0XHRcdHRoaXMuaW5pdE1vZGFsKCk7XG5cdFx0XHR0aGlzLmNhY2hlRWxlbWVudHMoKTtcblx0XHRcdHRoaXMuYmluZEV2ZW50cygpO1xuXHRcdH1cblx0fTtcblxuXHQkKCBmdW5jdGlvbigpIHtcblx0XHRFbGVtZW50b3JBZG1pbkRpYWxvZ0FwcC5pbml0KCk7XG5cdH0gKTtcblxufSggalF1ZXJ5ICkgKTtcbiIsInZhciBNb2RhbHM7XG5cbk1vZGFscyA9IHtcblx0aW5pdDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5pbml0TW9kYWxXaWRnZXRUeXBlKCk7XG5cdH0sXG5cblx0aW5pdE1vZGFsV2lkZ2V0VHlwZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG1vZGFsUHJvcGVydGllcyA9IHtcblx0XHRcdGdldERlZmF1bHRTZXR0aW5nczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzZXR0aW5ncyA9IERpYWxvZ3NNYW5hZ2VyLmdldFdpZGdldFR5cGUoICdvcHRpb25zJyApLnByb3RvdHlwZS5nZXREZWZhdWx0U2V0dGluZ3MuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG5cdFx0XHRcdHJldHVybiBfLmV4dGVuZCggc2V0dGluZ3MsIHtcblx0XHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdFx0bXk6ICdjZW50ZXInLFxuXHRcdFx0XHRcdFx0YXQ6ICdjZW50ZXInXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRjb250ZW50V2lkdGg6ICdhdXRvJyxcblx0XHRcdFx0XHRjb250ZW50SGVpZ2h0OiAnYXV0bycsXG5cdFx0XHRcdFx0Y2xvc2VCdXR0b246IHRydWVcblx0XHRcdFx0fSApO1xuXHRcdFx0fSxcblx0XHRcdGJ1aWxkV2lkZ2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0RGlhbG9nc01hbmFnZXIuZ2V0V2lkZ2V0VHlwZSggJ29wdGlvbnMnICkucHJvdG90eXBlLmJ1aWxkV2lkZ2V0LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdFx0XHRpZiAoICEgdGhpcy5nZXRTZXR0aW5ncyggJ2Nsb3NlQnV0dG9uJyApICkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHZhciAkY2xvc2VCdXR0b24gPSB0aGlzLmFkZEVsZW1lbnQoICdjbG9zZUJ1dHRvbicsICc8ZGl2PjxpIGNsYXNzPVwiZmEgZmEtdGltZXNcIj48L2k+PC9kaXY+JyApO1xuXG5cdFx0XHRcdHRoaXMuZ2V0RWxlbWVudHMoICd3aWRnZXRDb250ZW50JyApLnByZXBlbmQoICRjbG9zZUJ1dHRvbiApO1xuXHRcdFx0fSxcblx0XHRcdGF0dGFjaEV2ZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICggdGhpcy5nZXRTZXR0aW5ncyggJ2Nsb3NlQnV0dG9uJyApICkge1xuXHRcdFx0XHRcdHRoaXMuZ2V0RWxlbWVudHMoICdjbG9zZUJ1dHRvbicgKS5vbiggJ2NsaWNrJywgdGhpcy5oaWRlICk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRvblJlYWR5OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0RGlhbG9nc01hbmFnZXIuZ2V0V2lkZ2V0VHlwZSggJ29wdGlvbnMnICkucHJvdG90eXBlLm9uUmVhZHkuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG5cdFx0XHRcdHZhciBlbGVtZW50cyA9IHRoaXMuZ2V0RWxlbWVudHMoKSxcblx0XHRcdFx0XHRzZXR0aW5ncyA9IHRoaXMuZ2V0U2V0dGluZ3MoKTtcblxuXHRcdFx0XHRpZiAoICdhdXRvJyAhPT0gc2V0dGluZ3MuY29udGVudFdpZHRoICkge1xuXHRcdFx0XHRcdGVsZW1lbnRzLm1lc3NhZ2Uud2lkdGgoIHNldHRpbmdzLmNvbnRlbnRXaWR0aCApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCAnYXV0bycgIT09IHNldHRpbmdzLmNvbnRlbnRIZWlnaHQgKSB7XG5cdFx0XHRcdFx0ZWxlbWVudHMubWVzc2FnZS5oZWlnaHQoIHNldHRpbmdzLmNvbnRlbnRIZWlnaHQgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHREaWFsb2dzTWFuYWdlci5hZGRXaWRnZXRUeXBlKCAnZWxlbWVudG9yLW1vZGFsJywgRGlhbG9nc01hbmFnZXIuZ2V0V2lkZ2V0VHlwZSggJ29wdGlvbnMnICkuZXh0ZW5kKCAnZWxlbWVudG9yLW1vZGFsJywgbW9kYWxQcm9wZXJ0aWVzICkgKTtcblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2RhbHM7XG4iXX0=
