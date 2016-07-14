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
