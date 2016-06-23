var feedbackDialog;

( function( $ ) {

	feedbackDialog = {
		elements: {

		},

		init: function () {
			this.initElements();
			this.attachEvents();
			this.initModal();
		},

		initModal: function() {
			var modal;

			this.dialogsManager = new DialogsManager.Instance();
			this.getModal = function() {
				if ( ! modal ) {
					modal = this.dialogsManager.createWidget( 'confirm', {
						message: this.elements.$modal,
						strings: {
							confirm: 'Skip & Deactivate',
							cancel: 'Cancel'
						},
						defaultOption: 'cancel',
						onConfirm: _.bind( this.sendFeedback, this )
					} );
				}

				return modal;
			};
		},

		initElements: function () {
			this.elements.disablelink = $( '#elementor-plugin-disable-link' );
			this.elements.modalWrapper = $( '#elementor-feedback-dialog-wrapper');
			this.elements.$modal = $( '#elementor-feedback-dialog-content' );
			this.elements.reason = this.elements.$modal.find( '.elementor-reason' );
			this.elements.confirm = $( '#elementor-feedback-dialog-skip').find('.ui-button-text' );
		},

		attachEvents: function () {
			this.elements.disablelink.on( 'click', this.showModal );
			this.elements.reason.one( 'click', this.changeButtonText );
			this.elements.reason.on( 'change', this.reasonChanged );
		},

		showModal: function(e) {
			e.preventDefault();

			feedbackDialog.getModal().show();
		},

		changeButtonText: function() {
			feedbackDialog.getModal().getComponents( 'ok' ).html( 'Submit & Deactivate' );
		},

		reasonChanged: function() {
			$( '.elementor-reason-input' ).hide();

			if ( $( this ).hasClass( 'elementor-custom-input' ) ) {
				$( this ).find( '.elementor-reason-input' ).show();
			}
		},

		sendFeedback: function() {
			feedbackDialog.getModal().hide();
			var form = this.elements.$modal.find( 'form' ).serializeArray(),
				deactivateLink = this.elements.disablelink.attr( 'href' ),
				result = {};

			$.each( form, function() {
				if ( '' !== this.value )
					result[ this.name ] = this.value;
			});

			console.log( JSON.stringify( result ) );

		}
	};
}( jQuery) );

jQuery( function () {
	feedbackDialog.init();
} );