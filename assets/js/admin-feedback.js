(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
					contentHeight: 'auto'
				} );
			},
			buildWidget: function() {
				DialogsManager.getWidgetType( 'options' ).prototype.buildWidget.apply( this, arguments );

				var $closeButton = this.addElement( 'closeButton', '<div><i class="fa fa-times"></i></div>' );

				this.getElements( 'widgetContent' ).prepend( $closeButton );
			},
			attachEvents: function() {
				this.getElements( 'closeButton' ).on( 'click', this.hide );
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

},{}],2:[function(require,module,exports){
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
								name: 'deactivate',
								text: 'Deactivate Elementor', // TODO: gettext
								callback: _.bind( self.sendFeedback, self )
							} );

							this.addButton( {
								name: 'cancel',
								text: 'Cancel', // TODO: gettext
								callback: function() {
									self.getModal().hide();
								}
							} );
						}
					} );
				}

				return modal;
			};
		},

		sendFeedback: function() {
			var self = this;

			self.getModal().getElements( 'deactivate' ).text( 'In progress..' );

			$.post( ajaxurl, self.cache.$dialogForm.serialize(), function( data ) {
				location.href = self.cache.$deactivateLink.attr( 'href' );
			} );
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

},{"elementor-utils/modals":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvYWRtaW4vanMvZGV2L3V0aWxzL21vZGFscy5qcyIsImFzc2V0cy9qcy9kZXYvYWRtaW4tZmVlZGJhY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIE1vZGFscztcblxuTW9kYWxzID0ge1xuXHRpbml0OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmluaXRNb2RhbFdpZGdldFR5cGUoKTtcblx0fSxcblxuXHRpbml0TW9kYWxXaWRnZXRUeXBlOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbW9kYWxQcm9wZXJ0aWVzID0ge1xuXHRcdFx0Z2V0RGVmYXVsdFNldHRpbmdzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHNldHRpbmdzID0gRGlhbG9nc01hbmFnZXIuZ2V0V2lkZ2V0VHlwZSggJ29wdGlvbnMnICkucHJvdG90eXBlLmdldERlZmF1bHRTZXR0aW5ncy5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cblx0XHRcdFx0cmV0dXJuIF8uZXh0ZW5kKCBzZXR0aW5ncywge1xuXHRcdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0XHRteTogJ2NlbnRlcicsXG5cdFx0XHRcdFx0XHRhdDogJ2NlbnRlcidcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGNvbnRlbnRXaWR0aDogJ2F1dG8nLFxuXHRcdFx0XHRcdGNvbnRlbnRIZWlnaHQ6ICdhdXRvJ1xuXHRcdFx0XHR9ICk7XG5cdFx0XHR9LFxuXHRcdFx0YnVpbGRXaWRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHREaWFsb2dzTWFuYWdlci5nZXRXaWRnZXRUeXBlKCAnb3B0aW9ucycgKS5wcm90b3R5cGUuYnVpbGRXaWRnZXQuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG5cdFx0XHRcdHZhciAkY2xvc2VCdXR0b24gPSB0aGlzLmFkZEVsZW1lbnQoICdjbG9zZUJ1dHRvbicsICc8ZGl2PjxpIGNsYXNzPVwiZmEgZmEtdGltZXNcIj48L2k+PC9kaXY+JyApO1xuXG5cdFx0XHRcdHRoaXMuZ2V0RWxlbWVudHMoICd3aWRnZXRDb250ZW50JyApLnByZXBlbmQoICRjbG9zZUJ1dHRvbiApO1xuXHRcdFx0fSxcblx0XHRcdGF0dGFjaEV2ZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRoaXMuZ2V0RWxlbWVudHMoICdjbG9zZUJ1dHRvbicgKS5vbiggJ2NsaWNrJywgdGhpcy5oaWRlICk7XG5cdFx0XHR9LFxuXHRcdFx0b25SZWFkeTogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdERpYWxvZ3NNYW5hZ2VyLmdldFdpZGdldFR5cGUoICdvcHRpb25zJyApLnByb3RvdHlwZS5vblJlYWR5LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdFx0XHR2YXIgZWxlbWVudHMgPSB0aGlzLmdldEVsZW1lbnRzKCksXG5cdFx0XHRcdFx0c2V0dGluZ3MgPSB0aGlzLmdldFNldHRpbmdzKCk7XG5cblx0XHRcdFx0aWYgKCAnYXV0bycgIT09IHNldHRpbmdzLmNvbnRlbnRXaWR0aCApIHtcblx0XHRcdFx0XHRlbGVtZW50cy5tZXNzYWdlLndpZHRoKCBzZXR0aW5ncy5jb250ZW50V2lkdGggKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICggJ2F1dG8nICE9PSBzZXR0aW5ncy5jb250ZW50SGVpZ2h0ICkge1xuXHRcdFx0XHRcdGVsZW1lbnRzLm1lc3NhZ2UuaGVpZ2h0KCBzZXR0aW5ncy5jb250ZW50SGVpZ2h0ICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0RGlhbG9nc01hbmFnZXIuYWRkV2lkZ2V0VHlwZSggJ2VsZW1lbnRvci1tb2RhbCcsIERpYWxvZ3NNYW5hZ2VyLmdldFdpZGdldFR5cGUoICdvcHRpb25zJyApLmV4dGVuZCggJ2VsZW1lbnRvci1tb2RhbCcsIG1vZGFsUHJvcGVydGllcyApICk7XG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kYWxzO1xuIiwiLyogZ2xvYmFsIGpRdWVyeSwgRWxlbWVudG9yQWRtaW5GZWVkYmFja0FyZ3MgKi9cbiggZnVuY3Rpb24oICQgKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgRWxlbWVudG9yQWRtaW5EaWFsb2dBcHAgPSB7XG5cblx0XHRlbGVtZW50b3JNb2RhbHM6IHJlcXVpcmUoICdlbGVtZW50b3ItdXRpbHMvbW9kYWxzJyApLFxuXG5cdFx0ZGlhbG9nc01hbmFnZXI6IG5ldyBEaWFsb2dzTWFuYWdlci5JbnN0YW5jZSgpLFxuXG5cdFx0Y2FjaGVFbGVtZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmNhY2hlID0ge1xuXHRcdFx0XHQkZGVhY3RpdmF0ZUxpbms6ICQoICcjdGhlLWxpc3QnICkuZmluZCggJ1tkYXRhLXNsdWc9XCJlbGVtZW50b3JcIl0gc3Bhbi5kZWFjdGl2YXRlIGEnICksXG5cdFx0XHRcdCRkaWFsb2dIZWFkZXI6ICQoICcjZWxlbWVudG9yLWRlYWN0aXZhdGUtZmVlZGJhY2stZGlhbG9nLWhlYWRlcicgKSxcblx0XHRcdFx0JGRpYWxvZ0Zvcm06ICQoICcjZWxlbWVudG9yLWRlYWN0aXZhdGUtZmVlZGJhY2stZGlhbG9nLWZvcm0nIClcblx0XHRcdH07XG5cdFx0fSxcblxuXHRcdGJpbmRFdmVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0XHRzZWxmLmNhY2hlLiRkZWFjdGl2YXRlTGluay5vbiggJ2NsaWNrJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRcdHNlbGYuZ2V0TW9kYWwoKS5zaG93KCk7XG5cdFx0XHR9ICk7XG5cdFx0fSxcblxuXHRcdGluaXRNb2RhbDogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXMsXG5cdFx0XHRcdG1vZGFsO1xuXG5cdFx0XHRzZWxmLmdldE1vZGFsID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICggISBtb2RhbCApIHtcblx0XHRcdFx0XHRtb2RhbCA9IHNlbGYuZGlhbG9nc01hbmFnZXIuY3JlYXRlV2lkZ2V0KCAnZWxlbWVudG9yLW1vZGFsJywge1xuXHRcdFx0XHRcdFx0aWQ6ICdlbGVtZW50b3ItZGVhY3RpdmF0ZS1mZWVkYmFjay1tb2RhbCcsXG5cdFx0XHRcdFx0XHRoZWFkZXJNZXNzYWdlOiBzZWxmLmNhY2hlLiRkaWFsb2dIZWFkZXIsXG5cdFx0XHRcdFx0XHRtZXNzYWdlOiBzZWxmLmNhY2hlLiRkaWFsb2dGb3JtLFxuXHRcdFx0XHRcdFx0aGlkZU9uQnV0dG9uQ2xpY2s6IGZhbHNlLFxuXHRcdFx0XHRcdFx0b25SZWFkeTogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdERpYWxvZ3NNYW5hZ2VyLmdldFdpZGdldFR5cGUoICdlbGVtZW50b3ItbW9kYWwnICkucHJvdG90eXBlLm9uUmVhZHkuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG5cdFx0XHRcdFx0XHRcdHRoaXMuYWRkQnV0dG9uKCB7XG5cdFx0XHRcdFx0XHRcdFx0bmFtZTogJ2RlYWN0aXZhdGUnLFxuXHRcdFx0XHRcdFx0XHRcdHRleHQ6ICdEZWFjdGl2YXRlIEVsZW1lbnRvcicsIC8vIFRPRE86IGdldHRleHRcblx0XHRcdFx0XHRcdFx0XHRjYWxsYmFjazogXy5iaW5kKCBzZWxmLnNlbmRGZWVkYmFjaywgc2VsZiApXG5cdFx0XHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRcdFx0XHR0aGlzLmFkZEJ1dHRvbigge1xuXHRcdFx0XHRcdFx0XHRcdG5hbWU6ICdjYW5jZWwnLFxuXHRcdFx0XHRcdFx0XHRcdHRleHQ6ICdDYW5jZWwnLCAvLyBUT0RPOiBnZXR0ZXh0XG5cdFx0XHRcdFx0XHRcdFx0Y2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0c2VsZi5nZXRNb2RhbCgpLmhpZGUoKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gbW9kYWw7XG5cdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRzZW5kRmVlZGJhY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0XHRzZWxmLmdldE1vZGFsKCkuZ2V0RWxlbWVudHMoICdkZWFjdGl2YXRlJyApLnRleHQoICdJbiBwcm9ncmVzcy4uJyApO1xuXG5cdFx0XHQkLnBvc3QoIGFqYXh1cmwsIHNlbGYuY2FjaGUuJGRpYWxvZ0Zvcm0uc2VyaWFsaXplKCksIGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFx0XHRsb2NhdGlvbi5ocmVmID0gc2VsZi5jYWNoZS4kZGVhY3RpdmF0ZUxpbmsuYXR0ciggJ2hyZWYnICk7XG5cdFx0XHR9ICk7XG5cdFx0fSxcblxuXHRcdGluaXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5lbGVtZW50b3JNb2RhbHMuaW5pdCgpO1xuXHRcdFx0dGhpcy5pbml0TW9kYWwoKTtcblx0XHRcdHRoaXMuY2FjaGVFbGVtZW50cygpO1xuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKCk7XG5cdFx0fVxuXHR9O1xuXG5cdCQoIGZ1bmN0aW9uKCkge1xuXHRcdEVsZW1lbnRvckFkbWluRGlhbG9nQXBwLmluaXQoKTtcblx0fSApO1xuXG59KCBqUXVlcnkgKSApO1xuIl19
