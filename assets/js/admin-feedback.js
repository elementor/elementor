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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvZGV2L2pzL2FkbWluL2FkbWluLWZlZWRiYWNrLmpzIiwiYXNzZXRzL2Rldi9qcy9lZGl0b3IvdXRpbHMvbW9kYWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGdsb2JhbCBqUXVlcnksIEVsZW1lbnRvckFkbWluRmVlZGJhY2tBcmdzICovXHJcbiggZnVuY3Rpb24oICQgKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHR2YXIgRWxlbWVudG9yQWRtaW5EaWFsb2dBcHAgPSB7XHJcblxyXG5cdFx0ZWxlbWVudG9yTW9kYWxzOiByZXF1aXJlKCAnZWxlbWVudG9yLXV0aWxzL21vZGFscycgKSxcclxuXHJcblx0XHRkaWFsb2dzTWFuYWdlcjogbmV3IERpYWxvZ3NNYW5hZ2VyLkluc3RhbmNlKCksXHJcblxyXG5cdFx0Y2FjaGVFbGVtZW50czogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHRoaXMuY2FjaGUgPSB7XHJcblx0XHRcdFx0JGRlYWN0aXZhdGVMaW5rOiAkKCAnI3RoZS1saXN0JyApLmZpbmQoICdbZGF0YS1zbHVnPVwiZWxlbWVudG9yXCJdIHNwYW4uZGVhY3RpdmF0ZSBhJyApLFxyXG5cdFx0XHRcdCRkaWFsb2dIZWFkZXI6ICQoICcjZWxlbWVudG9yLWRlYWN0aXZhdGUtZmVlZGJhY2stZGlhbG9nLWhlYWRlcicgKSxcclxuXHRcdFx0XHQkZGlhbG9nRm9ybTogJCggJyNlbGVtZW50b3ItZGVhY3RpdmF0ZS1mZWVkYmFjay1kaWFsb2ctZm9ybScgKVxyXG5cdFx0XHR9O1xyXG5cdFx0fSxcclxuXHJcblx0XHRiaW5kRXZlbnRzOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuXHRcdFx0c2VsZi5jYWNoZS4kZGVhY3RpdmF0ZUxpbmsub24oICdjbGljaycsIGZ1bmN0aW9uKCBldmVudCApIHtcclxuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHRcdFx0XHRzZWxmLmdldE1vZGFsKCkuc2hvdygpO1xyXG5cdFx0XHR9ICk7XHJcblx0XHR9LFxyXG5cclxuXHRcdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRsb2NhdGlvbi5ocmVmID0gdGhpcy5jYWNoZS4kZGVhY3RpdmF0ZUxpbmsuYXR0ciggJ2hyZWYnICk7XHJcblx0XHR9LFxyXG5cclxuXHRcdGluaXRNb2RhbDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciBzZWxmID0gdGhpcyxcclxuXHRcdFx0XHRtb2RhbDtcclxuXHJcblx0XHRcdHNlbGYuZ2V0TW9kYWwgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRpZiAoICEgbW9kYWwgKSB7XHJcblx0XHRcdFx0XHRtb2RhbCA9IHNlbGYuZGlhbG9nc01hbmFnZXIuY3JlYXRlV2lkZ2V0KCAnZWxlbWVudG9yLW1vZGFsJywge1xyXG5cdFx0XHRcdFx0XHRpZDogJ2VsZW1lbnRvci1kZWFjdGl2YXRlLWZlZWRiYWNrLW1vZGFsJyxcclxuXHRcdFx0XHRcdFx0aGVhZGVyTWVzc2FnZTogc2VsZi5jYWNoZS4kZGlhbG9nSGVhZGVyLFxyXG5cdFx0XHRcdFx0XHRtZXNzYWdlOiBzZWxmLmNhY2hlLiRkaWFsb2dGb3JtLFxyXG5cdFx0XHRcdFx0XHRoaWRlT25CdXR0b25DbGljazogZmFsc2UsXHJcblx0XHRcdFx0XHRcdG9uUmVhZHk6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRcdERpYWxvZ3NNYW5hZ2VyLmdldFdpZGdldFR5cGUoICdlbGVtZW50b3ItbW9kYWwnICkucHJvdG90eXBlLm9uUmVhZHkuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR0aGlzLmFkZEJ1dHRvbigge1xyXG5cdFx0XHRcdFx0XHRcdFx0bmFtZTogJ3N1Ym1pdCcsXHJcblx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBFbGVtZW50b3JBZG1pbkZlZWRiYWNrQXJncy5pMThuLnN1Ym1pdF9uX2RlYWN0aXZhdGUsXHJcblx0XHRcdFx0XHRcdFx0XHRjYWxsYmFjazogXy5iaW5kKCBzZWxmLnNlbmRGZWVkYmFjaywgc2VsZiApXHJcblx0XHRcdFx0XHRcdFx0fSApO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoICEgRWxlbWVudG9yQWRtaW5GZWVkYmFja0FyZ3MuaXNfdHJhY2tlcl9vcHRlZF9pbiApIHtcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuYWRkQnV0dG9uKCB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdG5hbWU6ICdza2lwJyxcclxuXHRcdFx0XHRcdFx0XHRcdFx0dGV4dDogRWxlbWVudG9yQWRtaW5GZWVkYmFja0FyZ3MuaTE4bi5za2lwX25fZGVhY3RpdmF0ZSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0Y2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHNlbGYuZGVhY3RpdmF0ZSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHR9ICk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9ICk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gbW9kYWw7XHJcblx0XHRcdH07XHJcblx0XHR9LFxyXG5cclxuXHRcdHNlbmRGZWVkYmFjazogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciBzZWxmID0gdGhpcyxcclxuXHRcdFx0XHRmb3JtRGF0YSA9IHNlbGYuY2FjaGUuJGRpYWxvZ0Zvcm0uc2VyaWFsaXplKCk7XHJcblxyXG5cdFx0XHRzZWxmLmdldE1vZGFsKCkuZ2V0RWxlbWVudHMoICdzdWJtaXQnICkudGV4dCggJycgKS5hZGRDbGFzcyggJ2VsZW1lbnRvci1sb2FkaW5nJyApO1xyXG5cclxuXHRcdFx0JC5wb3N0KCBhamF4dXJsLCBmb3JtRGF0YSwgXy5iaW5kKCB0aGlzLmRlYWN0aXZhdGUsIHRoaXMgKSApO1xyXG5cdFx0fSxcclxuXHJcblx0XHRpbml0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0dGhpcy5lbGVtZW50b3JNb2RhbHMuaW5pdCgpO1xyXG5cdFx0XHR0aGlzLmluaXRNb2RhbCgpO1xyXG5cdFx0XHR0aGlzLmNhY2hlRWxlbWVudHMoKTtcclxuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKCk7XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0JCggZnVuY3Rpb24oKSB7XHJcblx0XHRFbGVtZW50b3JBZG1pbkRpYWxvZ0FwcC5pbml0KCk7XHJcblx0fSApO1xyXG5cclxufSggalF1ZXJ5ICkgKTtcclxuIiwidmFyIE1vZGFscztcclxuXHJcbk1vZGFscyA9IHtcclxuXHRpbml0OiBmdW5jdGlvbigpIHtcclxuXHRcdHRoaXMuaW5pdE1vZGFsV2lkZ2V0VHlwZSgpO1xyXG5cdH0sXHJcblxyXG5cdGluaXRNb2RhbFdpZGdldFR5cGU6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIG1vZGFsUHJvcGVydGllcyA9IHtcclxuXHRcdFx0Z2V0RGVmYXVsdFNldHRpbmdzOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgc2V0dGluZ3MgPSBEaWFsb2dzTWFuYWdlci5nZXRXaWRnZXRUeXBlKCAnb3B0aW9ucycgKS5wcm90b3R5cGUuZ2V0RGVmYXVsdFNldHRpbmdzLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcclxuXHJcblx0XHRcdFx0cmV0dXJuIF8uZXh0ZW5kKCBzZXR0aW5ncywge1xyXG5cdFx0XHRcdFx0cG9zaXRpb246IHtcclxuXHRcdFx0XHRcdFx0bXk6ICdjZW50ZXInLFxyXG5cdFx0XHRcdFx0XHRhdDogJ2NlbnRlcidcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRjb250ZW50V2lkdGg6ICdhdXRvJyxcclxuXHRcdFx0XHRcdGNvbnRlbnRIZWlnaHQ6ICdhdXRvJyxcclxuXHRcdFx0XHRcdGNsb3NlQnV0dG9uOiB0cnVlXHJcblx0XHRcdFx0fSApO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRidWlsZFdpZGdldDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0RGlhbG9nc01hbmFnZXIuZ2V0V2lkZ2V0VHlwZSggJ29wdGlvbnMnICkucHJvdG90eXBlLmJ1aWxkV2lkZ2V0LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcclxuXHJcblx0XHRcdFx0aWYgKCAhIHRoaXMuZ2V0U2V0dGluZ3MoICdjbG9zZUJ1dHRvbicgKSApIHtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHZhciAkY2xvc2VCdXR0b24gPSB0aGlzLmFkZEVsZW1lbnQoICdjbG9zZUJ1dHRvbicsICc8ZGl2PjxpIGNsYXNzPVwiZmEgZmEtdGltZXNcIj48L2k+PC9kaXY+JyApO1xyXG5cclxuXHRcdFx0XHR0aGlzLmdldEVsZW1lbnRzKCAnd2lkZ2V0Q29udGVudCcgKS5wcmVwZW5kKCAkY2xvc2VCdXR0b24gKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0YXR0YWNoRXZlbnRzOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRpZiAoIHRoaXMuZ2V0U2V0dGluZ3MoICdjbG9zZUJ1dHRvbicgKSApIHtcclxuXHRcdFx0XHRcdHRoaXMuZ2V0RWxlbWVudHMoICdjbG9zZUJ1dHRvbicgKS5vbiggJ2NsaWNrJywgdGhpcy5oaWRlICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRvblJlYWR5OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHREaWFsb2dzTWFuYWdlci5nZXRXaWRnZXRUeXBlKCAnb3B0aW9ucycgKS5wcm90b3R5cGUub25SZWFkeS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XHJcblxyXG5cdFx0XHRcdHZhciBlbGVtZW50cyA9IHRoaXMuZ2V0RWxlbWVudHMoKSxcclxuXHRcdFx0XHRcdHNldHRpbmdzID0gdGhpcy5nZXRTZXR0aW5ncygpO1xyXG5cclxuXHRcdFx0XHRpZiAoICdhdXRvJyAhPT0gc2V0dGluZ3MuY29udGVudFdpZHRoICkge1xyXG5cdFx0XHRcdFx0ZWxlbWVudHMubWVzc2FnZS53aWR0aCggc2V0dGluZ3MuY29udGVudFdpZHRoICk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoICdhdXRvJyAhPT0gc2V0dGluZ3MuY29udGVudEhlaWdodCApIHtcclxuXHRcdFx0XHRcdGVsZW1lbnRzLm1lc3NhZ2UuaGVpZ2h0KCBzZXR0aW5ncy5jb250ZW50SGVpZ2h0ICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdERpYWxvZ3NNYW5hZ2VyLmFkZFdpZGdldFR5cGUoICdlbGVtZW50b3ItbW9kYWwnLCBEaWFsb2dzTWFuYWdlci5nZXRXaWRnZXRUeXBlKCAnb3B0aW9ucycgKS5leHRlbmQoICdlbGVtZW50b3ItbW9kYWwnLCBtb2RhbFByb3BlcnRpZXMgKSApO1xyXG5cdH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW9kYWxzO1xyXG4iXX0=
