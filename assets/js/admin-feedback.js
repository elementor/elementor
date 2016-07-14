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

			self.cache.$dialogForm.one( 'change', function() {
				self.getModal().getElements( 'deactivate' )
				    .text( ElementorAdminFeedbackArgs.i18n.deactivate )
				    .addClass( 'elementor-active' );
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
								name: 'deactivate',
								text: ElementorAdminFeedbackArgs.i18n.skip_n_deactivate,
								callback: _.bind( self.sendFeedback, self )
							} );

							this.addButton( {
								name: 'cancel',
								text: ElementorAdminFeedbackArgs.i18n.cancel,
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
			var self = this,
				formData = self.cache.$dialogForm.serialize();

			if ( ! /reason_key=[a-z]/.test( formData ) ) {
				this.deactivate();
				return;
			}

			self.getModal().getElements( 'deactivate' ).text( '' ).addClass( 'elementor-loading' );

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

},{"elementor-utils/modals":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvYWRtaW4vanMvZGV2L3V0aWxzL21vZGFscy5qcyIsImFzc2V0cy9qcy9kZXYvYWRtaW4tZmVlZGJhY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBNb2RhbHM7XG5cbk1vZGFscyA9IHtcblx0aW5pdDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5pbml0TW9kYWxXaWRnZXRUeXBlKCk7XG5cdH0sXG5cblx0aW5pdE1vZGFsV2lkZ2V0VHlwZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG1vZGFsUHJvcGVydGllcyA9IHtcblx0XHRcdGdldERlZmF1bHRTZXR0aW5nczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzZXR0aW5ncyA9IERpYWxvZ3NNYW5hZ2VyLmdldFdpZGdldFR5cGUoICdvcHRpb25zJyApLnByb3RvdHlwZS5nZXREZWZhdWx0U2V0dGluZ3MuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG5cdFx0XHRcdHJldHVybiBfLmV4dGVuZCggc2V0dGluZ3MsIHtcblx0XHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdFx0bXk6ICdjZW50ZXInLFxuXHRcdFx0XHRcdFx0YXQ6ICdjZW50ZXInXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRjb250ZW50V2lkdGg6ICdhdXRvJyxcblx0XHRcdFx0XHRjb250ZW50SGVpZ2h0OiAnYXV0bydcblx0XHRcdFx0fSApO1xuXHRcdFx0fSxcblx0XHRcdGJ1aWxkV2lkZ2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0RGlhbG9nc01hbmFnZXIuZ2V0V2lkZ2V0VHlwZSggJ29wdGlvbnMnICkucHJvdG90eXBlLmJ1aWxkV2lkZ2V0LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdFx0XHR2YXIgJGNsb3NlQnV0dG9uID0gdGhpcy5hZGRFbGVtZW50KCAnY2xvc2VCdXR0b24nLCAnPGRpdj48aSBjbGFzcz1cImZhIGZhLXRpbWVzXCI+PC9pPjwvZGl2PicgKTtcblxuXHRcdFx0XHR0aGlzLmdldEVsZW1lbnRzKCAnd2lkZ2V0Q29udGVudCcgKS5wcmVwZW5kKCAkY2xvc2VCdXR0b24gKTtcblx0XHRcdH0sXG5cdFx0XHRhdHRhY2hFdmVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGlzLmdldEVsZW1lbnRzKCAnY2xvc2VCdXR0b24nICkub24oICdjbGljaycsIHRoaXMuaGlkZSApO1xuXHRcdFx0fSxcblx0XHRcdG9uUmVhZHk6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHREaWFsb2dzTWFuYWdlci5nZXRXaWRnZXRUeXBlKCAnb3B0aW9ucycgKS5wcm90b3R5cGUub25SZWFkeS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cblx0XHRcdFx0dmFyIGVsZW1lbnRzID0gdGhpcy5nZXRFbGVtZW50cygpLFxuXHRcdFx0XHRcdHNldHRpbmdzID0gdGhpcy5nZXRTZXR0aW5ncygpO1xuXG5cdFx0XHRcdGlmICggJ2F1dG8nICE9PSBzZXR0aW5ncy5jb250ZW50V2lkdGggKSB7XG5cdFx0XHRcdFx0ZWxlbWVudHMubWVzc2FnZS53aWR0aCggc2V0dGluZ3MuY29udGVudFdpZHRoICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoICdhdXRvJyAhPT0gc2V0dGluZ3MuY29udGVudEhlaWdodCApIHtcblx0XHRcdFx0XHRlbGVtZW50cy5tZXNzYWdlLmhlaWdodCggc2V0dGluZ3MuY29udGVudEhlaWdodCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdERpYWxvZ3NNYW5hZ2VyLmFkZFdpZGdldFR5cGUoICdlbGVtZW50b3ItbW9kYWwnLCBEaWFsb2dzTWFuYWdlci5nZXRXaWRnZXRUeXBlKCAnb3B0aW9ucycgKS5leHRlbmQoICdlbGVtZW50b3ItbW9kYWwnLCBtb2RhbFByb3BlcnRpZXMgKSApO1xuXHR9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGFscztcbiIsIi8qIGdsb2JhbCBqUXVlcnksIEVsZW1lbnRvckFkbWluRmVlZGJhY2tBcmdzICovXG4oIGZ1bmN0aW9uKCAkICkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIEVsZW1lbnRvckFkbWluRGlhbG9nQXBwID0ge1xuXG5cdFx0ZWxlbWVudG9yTW9kYWxzOiByZXF1aXJlKCAnZWxlbWVudG9yLXV0aWxzL21vZGFscycgKSxcblxuXHRcdGRpYWxvZ3NNYW5hZ2VyOiBuZXcgRGlhbG9nc01hbmFnZXIuSW5zdGFuY2UoKSxcblxuXHRcdGNhY2hlRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5jYWNoZSA9IHtcblx0XHRcdFx0JGRlYWN0aXZhdGVMaW5rOiAkKCAnI3RoZS1saXN0JyApLmZpbmQoICdbZGF0YS1zbHVnPVwiZWxlbWVudG9yXCJdIHNwYW4uZGVhY3RpdmF0ZSBhJyApLFxuXHRcdFx0XHQkZGlhbG9nSGVhZGVyOiAkKCAnI2VsZW1lbnRvci1kZWFjdGl2YXRlLWZlZWRiYWNrLWRpYWxvZy1oZWFkZXInICksXG5cdFx0XHRcdCRkaWFsb2dGb3JtOiAkKCAnI2VsZW1lbnRvci1kZWFjdGl2YXRlLWZlZWRiYWNrLWRpYWxvZy1mb3JtJyApXG5cdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRiaW5kRXZlbnRzOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdFx0c2VsZi5jYWNoZS4kZGVhY3RpdmF0ZUxpbmsub24oICdjbGljaycsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0XHRzZWxmLmdldE1vZGFsKCkuc2hvdygpO1xuXHRcdFx0fSApO1xuXG5cdFx0XHRzZWxmLmNhY2hlLiRkaWFsb2dGb3JtLm9uZSggJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzZWxmLmdldE1vZGFsKCkuZ2V0RWxlbWVudHMoICdkZWFjdGl2YXRlJyApXG5cdFx0XHRcdCAgICAudGV4dCggRWxlbWVudG9yQWRtaW5GZWVkYmFja0FyZ3MuaTE4bi5kZWFjdGl2YXRlIClcblx0XHRcdFx0ICAgIC5hZGRDbGFzcyggJ2VsZW1lbnRvci1hY3RpdmUnICk7XG5cdFx0XHR9ICk7XG5cdFx0fSxcblxuXHRcdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bG9jYXRpb24uaHJlZiA9IHRoaXMuY2FjaGUuJGRlYWN0aXZhdGVMaW5rLmF0dHIoICdocmVmJyApO1xuXHRcdH0sXG5cblx0XHRpbml0TW9kYWw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzLFxuXHRcdFx0XHRtb2RhbDtcblxuXHRcdFx0c2VsZi5nZXRNb2RhbCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoICEgbW9kYWwgKSB7XG5cdFx0XHRcdFx0bW9kYWwgPSBzZWxmLmRpYWxvZ3NNYW5hZ2VyLmNyZWF0ZVdpZGdldCggJ2VsZW1lbnRvci1tb2RhbCcsIHtcblx0XHRcdFx0XHRcdGlkOiAnZWxlbWVudG9yLWRlYWN0aXZhdGUtZmVlZGJhY2stbW9kYWwnLFxuXHRcdFx0XHRcdFx0aGVhZGVyTWVzc2FnZTogc2VsZi5jYWNoZS4kZGlhbG9nSGVhZGVyLFxuXHRcdFx0XHRcdFx0bWVzc2FnZTogc2VsZi5jYWNoZS4kZGlhbG9nRm9ybSxcblx0XHRcdFx0XHRcdGhpZGVPbkJ1dHRvbkNsaWNrOiBmYWxzZSxcblx0XHRcdFx0XHRcdG9uUmVhZHk6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHREaWFsb2dzTWFuYWdlci5nZXRXaWRnZXRUeXBlKCAnZWxlbWVudG9yLW1vZGFsJyApLnByb3RvdHlwZS5vblJlYWR5LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdFx0XHRcdFx0XHR0aGlzLmFkZEJ1dHRvbigge1xuXHRcdFx0XHRcdFx0XHRcdG5hbWU6ICdkZWFjdGl2YXRlJyxcblx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBFbGVtZW50b3JBZG1pbkZlZWRiYWNrQXJncy5pMThuLnNraXBfbl9kZWFjdGl2YXRlLFxuXHRcdFx0XHRcdFx0XHRcdGNhbGxiYWNrOiBfLmJpbmQoIHNlbGYuc2VuZEZlZWRiYWNrLCBzZWxmIClcblx0XHRcdFx0XHRcdFx0fSApO1xuXG5cdFx0XHRcdFx0XHRcdHRoaXMuYWRkQnV0dG9uKCB7XG5cdFx0XHRcdFx0XHRcdFx0bmFtZTogJ2NhbmNlbCcsXG5cdFx0XHRcdFx0XHRcdFx0dGV4dDogRWxlbWVudG9yQWRtaW5GZWVkYmFja0FyZ3MuaTE4bi5jYW5jZWwsXG5cdFx0XHRcdFx0XHRcdFx0Y2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0c2VsZi5nZXRNb2RhbCgpLmhpZGUoKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gbW9kYWw7XG5cdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRzZW5kRmVlZGJhY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzLFxuXHRcdFx0XHRmb3JtRGF0YSA9IHNlbGYuY2FjaGUuJGRpYWxvZ0Zvcm0uc2VyaWFsaXplKCk7XG5cblx0XHRcdGlmICggISAvcmVhc29uX2tleT1bYS16XS8udGVzdCggZm9ybURhdGEgKSApIHtcblx0XHRcdFx0dGhpcy5kZWFjdGl2YXRlKCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0c2VsZi5nZXRNb2RhbCgpLmdldEVsZW1lbnRzKCAnZGVhY3RpdmF0ZScgKS50ZXh0KCAnJyApLmFkZENsYXNzKCAnZWxlbWVudG9yLWxvYWRpbmcnICk7XG5cblx0XHRcdCQucG9zdCggYWpheHVybCwgZm9ybURhdGEsIF8uYmluZCggdGhpcy5kZWFjdGl2YXRlLCB0aGlzICkgKTtcblx0XHR9LFxuXG5cdFx0aW5pdDogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmVsZW1lbnRvck1vZGFscy5pbml0KCk7XG5cdFx0XHR0aGlzLmluaXRNb2RhbCgpO1xuXHRcdFx0dGhpcy5jYWNoZUVsZW1lbnRzKCk7XG5cdFx0XHR0aGlzLmJpbmRFdmVudHMoKTtcblx0XHR9XG5cdH07XG5cblx0JCggZnVuY3Rpb24oKSB7XG5cdFx0RWxlbWVudG9yQWRtaW5EaWFsb2dBcHAuaW5pdCgpO1xuXHR9ICk7XG5cbn0oIGpRdWVyeSApICk7XG4iXX0=
