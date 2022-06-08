( function( $ ) {
	'use strict';

	var ElementorAdminDialogApp = {

		cacheElements() {
			this.cache = {
				$deactivateLink: $( '#the-list' ).find( '[data-slug="elementor"] span.deactivate a' ),
				$dialogHeader: $( '#elementor-deactivate-feedback-dialog-header' ),
				$dialogForm: $( '#elementor-deactivate-feedback-dialog-form' ),
			};
		},

		bindEvents() {
			var self = this;

			self.cache.$deactivateLink.on( 'click', function( event ) {
				event.preventDefault();

				self.getModal().show();
			} );
		},

		deactivate() {
			location.href = this.cache.$deactivateLink.attr( 'href' );
		},

		initModal() {
			var self = this,
				modal;

			self.getModal = function() {
				if ( ! modal ) {
					modal = elementorCommon.dialogsManager.createWidget( 'lightbox', {
						id: 'elementor-deactivate-feedback-modal',
						headerMessage: self.cache.$dialogHeader,
						message: self.cache.$dialogForm,
						hide: {
							onButtonClick: false,
						},
						position: {
							my: 'center',
							at: 'center',
						},
						onReady() {
							DialogsManager.getWidgetType( 'lightbox' ).prototype.onReady.apply( this, arguments );

							this.addButton( {
								name: 'submit',
								text: __( 'Submit & Deactivate', 'elementor' ),
								callback: self.sendFeedback.bind( self ),
							} );

							this.addButton( {
								name: 'skip',
								text: __( 'Skip & Deactivate', 'elementor' ),
								callback() {
									self.deactivate();
								},
							} );
						},

						onShow() {
							var $dialogModal = $( '#elementor-deactivate-feedback-modal' ),
								radioSelector = '.elementor-deactivate-feedback-dialog-input';

							$dialogModal.find( radioSelector ).on( 'change', function() {
								$dialogModal.attr( 'data-feedback-selected', $( this ).val() );
							} );

							$dialogModal.find( radioSelector + ':checked' ).trigger( 'change' );
						},
					} );
				}

				return modal;
			};
		},

		sendFeedback() {
			var self = this,
				formData = self.cache.$dialogForm.serialize();

			self.getModal().getElements( 'submit' ).text( '' ).addClass( 'elementor-loading' );

			$.post( ajaxurl, formData, this.deactivate.bind( this ) );
		},

		init() {
			this.initModal();
			this.cacheElements();
			this.bindEvents();
		},
	};

	$( function() {
		ElementorAdminDialogApp.init();
	} );
}( jQuery ) );
