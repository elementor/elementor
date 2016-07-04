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

							this.addButton({
								name: 'deactivate',
								text: 'Deactivate Elementor', // TODO: gettext
								callback: _.bind( self.sendFeedback, self )
							});

							this.addButton({
								name: 'cancel',
								text: 'Cancel', // TODO: gettext
								callback: function() {
									self.getModal().hide();
								}
							});
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
				//console.log( data );
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvYWRtaW4vanMvZGV2L3V0aWxzL21vZGFscy5qcyIsImFzc2V0cy9qcy9kZXYvYWRtaW4tZmVlZGJhY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgTW9kYWxzO1xuXG5Nb2RhbHMgPSB7XG5cdGluaXQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuaW5pdE1vZGFsV2lkZ2V0VHlwZSgpO1xuXHR9LFxuXG5cdGluaXRNb2RhbFdpZGdldFR5cGU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBtb2RhbFByb3BlcnRpZXMgPSB7XG5cdFx0XHRnZXREZWZhdWx0U2V0dGluZ3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc2V0dGluZ3MgPSBEaWFsb2dzTWFuYWdlci5nZXRXaWRnZXRUeXBlKCAnb3B0aW9ucycgKS5wcm90b3R5cGUuZ2V0RGVmYXVsdFNldHRpbmdzLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdFx0XHRyZXR1cm4gXy5leHRlbmQoIHNldHRpbmdzLCB7XG5cdFx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRcdG15OiAnY2VudGVyJyxcblx0XHRcdFx0XHRcdGF0OiAnY2VudGVyJ1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Y29udGVudFdpZHRoOiAnYXV0bycsXG5cdFx0XHRcdFx0Y29udGVudEhlaWdodDogJ2F1dG8nXG5cdFx0XHRcdH0gKTtcblx0XHRcdH0sXG5cdFx0XHRidWlsZFdpZGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdERpYWxvZ3NNYW5hZ2VyLmdldFdpZGdldFR5cGUoICdvcHRpb25zJyApLnByb3RvdHlwZS5idWlsZFdpZGdldC5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cblx0XHRcdFx0dmFyICRjbG9zZUJ1dHRvbiA9IHRoaXMuYWRkRWxlbWVudCggJ2Nsb3NlQnV0dG9uJywgJzxkaXY+PGkgY2xhc3M9XCJmYSBmYS10aW1lc1wiPjwvaT48L2Rpdj4nICk7XG5cblx0XHRcdFx0dGhpcy5nZXRFbGVtZW50cyggJ3dpZGdldENvbnRlbnQnICkucHJlcGVuZCggJGNsb3NlQnV0dG9uICk7XG5cdFx0XHR9LFxuXHRcdFx0YXR0YWNoRXZlbnRzOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhpcy5nZXRFbGVtZW50cyggJ2Nsb3NlQnV0dG9uJyApLm9uKCAnY2xpY2snLCB0aGlzLmhpZGUgKTtcblx0XHRcdH0sXG5cdFx0XHRvblJlYWR5OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0RGlhbG9nc01hbmFnZXIuZ2V0V2lkZ2V0VHlwZSggJ29wdGlvbnMnICkucHJvdG90eXBlLm9uUmVhZHkuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG5cdFx0XHRcdHZhciBlbGVtZW50cyA9IHRoaXMuZ2V0RWxlbWVudHMoKSxcblx0XHRcdFx0XHRzZXR0aW5ncyA9IHRoaXMuZ2V0U2V0dGluZ3MoKTtcblxuXHRcdFx0XHRpZiAoICdhdXRvJyAhPT0gc2V0dGluZ3MuY29udGVudFdpZHRoICkge1xuXHRcdFx0XHRcdGVsZW1lbnRzLm1lc3NhZ2Uud2lkdGgoIHNldHRpbmdzLmNvbnRlbnRXaWR0aCApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCAnYXV0bycgIT09IHNldHRpbmdzLmNvbnRlbnRIZWlnaHQgKSB7XG5cdFx0XHRcdFx0ZWxlbWVudHMubWVzc2FnZS5oZWlnaHQoIHNldHRpbmdzLmNvbnRlbnRIZWlnaHQgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHREaWFsb2dzTWFuYWdlci5hZGRXaWRnZXRUeXBlKCAnZWxlbWVudG9yLW1vZGFsJywgRGlhbG9nc01hbmFnZXIuZ2V0V2lkZ2V0VHlwZSggJ29wdGlvbnMnICkuZXh0ZW5kKCAnZWxlbWVudG9yLW1vZGFsJywgbW9kYWxQcm9wZXJ0aWVzICkgKTtcblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2RhbHM7XG4iLCIvKiBnbG9iYWwgalF1ZXJ5LCBFbGVtZW50b3JBZG1pbkZlZWRiYWNrQXJncyAqL1xuKCBmdW5jdGlvbiggJCApIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBFbGVtZW50b3JBZG1pbkRpYWxvZ0FwcCA9IHtcblxuXHRcdGVsZW1lbnRvck1vZGFsczogcmVxdWlyZSggJ2VsZW1lbnRvci11dGlscy9tb2RhbHMnICksXG5cblx0XHRkaWFsb2dzTWFuYWdlcjogbmV3IERpYWxvZ3NNYW5hZ2VyLkluc3RhbmNlKCksXG5cblx0XHRjYWNoZUVsZW1lbnRzOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY2FjaGUgPSB7XG5cdFx0XHRcdCRkZWFjdGl2YXRlTGluazogJCggJyN0aGUtbGlzdCcgKS5maW5kKCAnW2RhdGEtc2x1Zz1cImVsZW1lbnRvclwiXSBzcGFuLmRlYWN0aXZhdGUgYScgKSxcblx0XHRcdFx0JGRpYWxvZ0hlYWRlcjogJCggJyNlbGVtZW50b3ItZGVhY3RpdmF0ZS1mZWVkYmFjay1kaWFsb2ctaGVhZGVyJyApLFxuXHRcdFx0XHQkZGlhbG9nRm9ybTogJCggJyNlbGVtZW50b3ItZGVhY3RpdmF0ZS1mZWVkYmFjay1kaWFsb2ctZm9ybScgKVxuXHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0YmluZEV2ZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHRcdHNlbGYuY2FjaGUuJGRlYWN0aXZhdGVMaW5rLm9uKCAnY2xpY2snLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdFx0c2VsZi5nZXRNb2RhbCgpLnNob3coKTtcblx0XHRcdH0gKTtcblx0XHR9LFxuXG5cdFx0aW5pdE1vZGFsOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdFx0bW9kYWw7XG5cblx0XHRcdHNlbGYuZ2V0TW9kYWwgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKCAhIG1vZGFsICkge1xuXHRcdFx0XHRcdG1vZGFsID0gc2VsZi5kaWFsb2dzTWFuYWdlci5jcmVhdGVXaWRnZXQoICdlbGVtZW50b3ItbW9kYWwnLCB7XG5cdFx0XHRcdFx0XHRpZDogJ2VsZW1lbnRvci1kZWFjdGl2YXRlLWZlZWRiYWNrLW1vZGFsJyxcblx0XHRcdFx0XHRcdGhlYWRlck1lc3NhZ2U6IHNlbGYuY2FjaGUuJGRpYWxvZ0hlYWRlcixcblx0XHRcdFx0XHRcdG1lc3NhZ2U6IHNlbGYuY2FjaGUuJGRpYWxvZ0Zvcm0sXG5cdFx0XHRcdFx0XHRoaWRlT25CdXR0b25DbGljazogZmFsc2UsXG5cdFx0XHRcdFx0XHRvblJlYWR5OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0RGlhbG9nc01hbmFnZXIuZ2V0V2lkZ2V0VHlwZSggJ2VsZW1lbnRvci1tb2RhbCcgKS5wcm90b3R5cGUub25SZWFkeS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cblx0XHRcdFx0XHRcdFx0dGhpcy5hZGRCdXR0b24oe1xuXHRcdFx0XHRcdFx0XHRcdG5hbWU6ICdkZWFjdGl2YXRlJyxcblx0XHRcdFx0XHRcdFx0XHR0ZXh0OiAnRGVhY3RpdmF0ZSBFbGVtZW50b3InLCAvLyBUT0RPOiBnZXR0ZXh0XG5cdFx0XHRcdFx0XHRcdFx0Y2FsbGJhY2s6IF8uYmluZCggc2VsZi5zZW5kRmVlZGJhY2ssIHNlbGYgKVxuXHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHR0aGlzLmFkZEJ1dHRvbih7XG5cdFx0XHRcdFx0XHRcdFx0bmFtZTogJ2NhbmNlbCcsXG5cdFx0XHRcdFx0XHRcdFx0dGV4dDogJ0NhbmNlbCcsIC8vIFRPRE86IGdldHRleHRcblx0XHRcdFx0XHRcdFx0XHRjYWxsYmFjazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRzZWxmLmdldE1vZGFsKCkuaGlkZSgpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG1vZGFsO1xuXHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0c2VuZEZlZWRiYWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdFx0c2VsZi5nZXRNb2RhbCgpLmdldEVsZW1lbnRzKCAnZGVhY3RpdmF0ZScgKS50ZXh0KCAnSW4gcHJvZ3Jlc3MuLicgKTtcblxuXHRcdFx0JC5wb3N0KCBhamF4dXJsLCBzZWxmLmNhY2hlLiRkaWFsb2dGb3JtLnNlcmlhbGl6ZSgpLCBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdFx0bG9jYXRpb24uaHJlZiA9IHNlbGYuY2FjaGUuJGRlYWN0aXZhdGVMaW5rLmF0dHIoICdocmVmJyApO1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKCBkYXRhICk7XG5cdFx0XHR9ICk7XG5cdFx0fSxcblxuXHRcdGluaXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5lbGVtZW50b3JNb2RhbHMuaW5pdCgpO1xuXHRcdFx0dGhpcy5pbml0TW9kYWwoKTtcblx0XHRcdHRoaXMuY2FjaGVFbGVtZW50cygpO1xuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKCk7XG5cdFx0fVxuXHR9O1xuXG5cdCQoIGZ1bmN0aW9uKCkge1xuXHRcdEVsZW1lbnRvckFkbWluRGlhbG9nQXBwLmluaXQoKTtcblx0fSApO1xuXG59KCBqUXVlcnkgKSApO1xuIl19
