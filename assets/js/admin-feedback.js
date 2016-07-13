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
				self.getModal().getElements( 'deactivate' ).text( ElementorAdminFeedbackArgs.i18n.deactivate );
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
			var self = this;

			var data = self.cache.$dialogForm.serialize();

			if ( ! /reason_key=[a-z]/.test( data ) ) {
				this.deactivate();

				return;
			}

			self.getModal().getElements( 'deactivate' ).text( '' ).addClass( 'elementor-loading' );

			$.post( ajaxurl, data, _.bind( this.deactivate, this ) );
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvYWRtaW4vanMvZGV2L3V0aWxzL21vZGFscy5qcyIsImFzc2V0cy9qcy9kZXYvYWRtaW4tZmVlZGJhY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBNb2RhbHM7XG5cbk1vZGFscyA9IHtcblx0aW5pdDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5pbml0TW9kYWxXaWRnZXRUeXBlKCk7XG5cdH0sXG5cblx0aW5pdE1vZGFsV2lkZ2V0VHlwZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG1vZGFsUHJvcGVydGllcyA9IHtcblx0XHRcdGdldERlZmF1bHRTZXR0aW5nczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzZXR0aW5ncyA9IERpYWxvZ3NNYW5hZ2VyLmdldFdpZGdldFR5cGUoICdvcHRpb25zJyApLnByb3RvdHlwZS5nZXREZWZhdWx0U2V0dGluZ3MuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG5cdFx0XHRcdHJldHVybiBfLmV4dGVuZCggc2V0dGluZ3MsIHtcblx0XHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdFx0bXk6ICdjZW50ZXInLFxuXHRcdFx0XHRcdFx0YXQ6ICdjZW50ZXInXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRjb250ZW50V2lkdGg6ICdhdXRvJyxcblx0XHRcdFx0XHRjb250ZW50SGVpZ2h0OiAnYXV0bydcblx0XHRcdFx0fSApO1xuXHRcdFx0fSxcblx0XHRcdGJ1aWxkV2lkZ2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0RGlhbG9nc01hbmFnZXIuZ2V0V2lkZ2V0VHlwZSggJ29wdGlvbnMnICkucHJvdG90eXBlLmJ1aWxkV2lkZ2V0LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdFx0XHR2YXIgJGNsb3NlQnV0dG9uID0gdGhpcy5hZGRFbGVtZW50KCAnY2xvc2VCdXR0b24nLCAnPGRpdj48aSBjbGFzcz1cImZhIGZhLXRpbWVzXCI+PC9pPjwvZGl2PicgKTtcblxuXHRcdFx0XHR0aGlzLmdldEVsZW1lbnRzKCAnd2lkZ2V0Q29udGVudCcgKS5wcmVwZW5kKCAkY2xvc2VCdXR0b24gKTtcblx0XHRcdH0sXG5cdFx0XHRhdHRhY2hFdmVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGlzLmdldEVsZW1lbnRzKCAnY2xvc2VCdXR0b24nICkub24oICdjbGljaycsIHRoaXMuaGlkZSApO1xuXHRcdFx0fSxcblx0XHRcdG9uUmVhZHk6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHREaWFsb2dzTWFuYWdlci5nZXRXaWRnZXRUeXBlKCAnb3B0aW9ucycgKS5wcm90b3R5cGUub25SZWFkeS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cblx0XHRcdFx0dmFyIGVsZW1lbnRzID0gdGhpcy5nZXRFbGVtZW50cygpLFxuXHRcdFx0XHRcdHNldHRpbmdzID0gdGhpcy5nZXRTZXR0aW5ncygpO1xuXG5cdFx0XHRcdGlmICggJ2F1dG8nICE9PSBzZXR0aW5ncy5jb250ZW50V2lkdGggKSB7XG5cdFx0XHRcdFx0ZWxlbWVudHMubWVzc2FnZS53aWR0aCggc2V0dGluZ3MuY29udGVudFdpZHRoICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoICdhdXRvJyAhPT0gc2V0dGluZ3MuY29udGVudEhlaWdodCApIHtcblx0XHRcdFx0XHRlbGVtZW50cy5tZXNzYWdlLmhlaWdodCggc2V0dGluZ3MuY29udGVudEhlaWdodCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdERpYWxvZ3NNYW5hZ2VyLmFkZFdpZGdldFR5cGUoICdlbGVtZW50b3ItbW9kYWwnLCBEaWFsb2dzTWFuYWdlci5nZXRXaWRnZXRUeXBlKCAnb3B0aW9ucycgKS5leHRlbmQoICdlbGVtZW50b3ItbW9kYWwnLCBtb2RhbFByb3BlcnRpZXMgKSApO1xuXHR9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGFscztcbiIsIi8qIGdsb2JhbCBqUXVlcnksIEVsZW1lbnRvckFkbWluRmVlZGJhY2tBcmdzICovXG4oIGZ1bmN0aW9uKCAkICkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIEVsZW1lbnRvckFkbWluRGlhbG9nQXBwID0ge1xuXG5cdFx0ZWxlbWVudG9yTW9kYWxzOiByZXF1aXJlKCAnZWxlbWVudG9yLXV0aWxzL21vZGFscycgKSxcblxuXHRcdGRpYWxvZ3NNYW5hZ2VyOiBuZXcgRGlhbG9nc01hbmFnZXIuSW5zdGFuY2UoKSxcblxuXHRcdGNhY2hlRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5jYWNoZSA9IHtcblx0XHRcdFx0JGRlYWN0aXZhdGVMaW5rOiAkKCAnI3RoZS1saXN0JyApLmZpbmQoICdbZGF0YS1zbHVnPVwiZWxlbWVudG9yXCJdIHNwYW4uZGVhY3RpdmF0ZSBhJyApLFxuXHRcdFx0XHQkZGlhbG9nSGVhZGVyOiAkKCAnI2VsZW1lbnRvci1kZWFjdGl2YXRlLWZlZWRiYWNrLWRpYWxvZy1oZWFkZXInICksXG5cdFx0XHRcdCRkaWFsb2dGb3JtOiAkKCAnI2VsZW1lbnRvci1kZWFjdGl2YXRlLWZlZWRiYWNrLWRpYWxvZy1mb3JtJyApXG5cdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRiaW5kRXZlbnRzOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdFx0c2VsZi5jYWNoZS4kZGVhY3RpdmF0ZUxpbmsub24oICdjbGljaycsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0XHRzZWxmLmdldE1vZGFsKCkuc2hvdygpO1xuXHRcdFx0fSApO1xuXG5cdFx0XHRzZWxmLmNhY2hlLiRkaWFsb2dGb3JtLm9uZSggJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzZWxmLmdldE1vZGFsKCkuZ2V0RWxlbWVudHMoICdkZWFjdGl2YXRlJyApLnRleHQoIEVsZW1lbnRvckFkbWluRmVlZGJhY2tBcmdzLmkxOG4uZGVhY3RpdmF0ZSApO1xuXHRcdFx0fSApO1xuXHRcdH0sXG5cblx0XHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHRcdGxvY2F0aW9uLmhyZWYgPSB0aGlzLmNhY2hlLiRkZWFjdGl2YXRlTGluay5hdHRyKCAnaHJlZicgKTtcblx0XHR9LFxuXG5cdFx0aW5pdE1vZGFsOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdFx0bW9kYWw7XG5cblx0XHRcdHNlbGYuZ2V0TW9kYWwgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKCAhIG1vZGFsICkge1xuXHRcdFx0XHRcdG1vZGFsID0gc2VsZi5kaWFsb2dzTWFuYWdlci5jcmVhdGVXaWRnZXQoICdlbGVtZW50b3ItbW9kYWwnLCB7XG5cdFx0XHRcdFx0XHRpZDogJ2VsZW1lbnRvci1kZWFjdGl2YXRlLWZlZWRiYWNrLW1vZGFsJyxcblx0XHRcdFx0XHRcdGhlYWRlck1lc3NhZ2U6IHNlbGYuY2FjaGUuJGRpYWxvZ0hlYWRlcixcblx0XHRcdFx0XHRcdG1lc3NhZ2U6IHNlbGYuY2FjaGUuJGRpYWxvZ0Zvcm0sXG5cdFx0XHRcdFx0XHRoaWRlT25CdXR0b25DbGljazogZmFsc2UsXG5cdFx0XHRcdFx0XHRvblJlYWR5OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0RGlhbG9nc01hbmFnZXIuZ2V0V2lkZ2V0VHlwZSggJ2VsZW1lbnRvci1tb2RhbCcgKS5wcm90b3R5cGUub25SZWFkeS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cblx0XHRcdFx0XHRcdFx0dGhpcy5hZGRCdXR0b24oIHtcblx0XHRcdFx0XHRcdFx0XHRuYW1lOiAnZGVhY3RpdmF0ZScsXG5cdFx0XHRcdFx0XHRcdFx0dGV4dDogRWxlbWVudG9yQWRtaW5GZWVkYmFja0FyZ3MuaTE4bi5za2lwX25fZGVhY3RpdmF0ZSxcblx0XHRcdFx0XHRcdFx0XHRjYWxsYmFjazogXy5iaW5kKCBzZWxmLnNlbmRGZWVkYmFjaywgc2VsZiApXG5cdFx0XHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRcdFx0XHR0aGlzLmFkZEJ1dHRvbigge1xuXHRcdFx0XHRcdFx0XHRcdG5hbWU6ICdjYW5jZWwnLFxuXHRcdFx0XHRcdFx0XHRcdHRleHQ6IEVsZW1lbnRvckFkbWluRmVlZGJhY2tBcmdzLmkxOG4uY2FuY2VsLFxuXHRcdFx0XHRcdFx0XHRcdGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHNlbGYuZ2V0TW9kYWwoKS5oaWRlKCk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG1vZGFsO1xuXHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0c2VuZEZlZWRiYWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdFx0dmFyIGRhdGEgPSBzZWxmLmNhY2hlLiRkaWFsb2dGb3JtLnNlcmlhbGl6ZSgpO1xuXG5cdFx0XHRpZiAoICEgL3JlYXNvbl9rZXk9W2Etel0vLnRlc3QoIGRhdGEgKSApIHtcblx0XHRcdFx0dGhpcy5kZWFjdGl2YXRlKCk7XG5cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRzZWxmLmdldE1vZGFsKCkuZ2V0RWxlbWVudHMoICdkZWFjdGl2YXRlJyApLnRleHQoICcnICkuYWRkQ2xhc3MoICdlbGVtZW50b3ItbG9hZGluZycgKTtcblxuXHRcdFx0JC5wb3N0KCBhamF4dXJsLCBkYXRhLCBfLmJpbmQoIHRoaXMuZGVhY3RpdmF0ZSwgdGhpcyApICk7XG5cdFx0fSxcblxuXHRcdGluaXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5lbGVtZW50b3JNb2RhbHMuaW5pdCgpO1xuXHRcdFx0dGhpcy5pbml0TW9kYWwoKTtcblx0XHRcdHRoaXMuY2FjaGVFbGVtZW50cygpO1xuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKCk7XG5cdFx0fVxuXHR9O1xuXG5cdCQoIGZ1bmN0aW9uKCkge1xuXHRcdEVsZW1lbnRvckFkbWluRGlhbG9nQXBwLmluaXQoKTtcblx0fSApO1xuXG59KCBqUXVlcnkgKSApO1xuIl19
