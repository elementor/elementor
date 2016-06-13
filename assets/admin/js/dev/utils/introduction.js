var Introduction;

Introduction = function() {
	var self = this,
		modal,
		infoDialog;

	var initModal = function() {
		modal = elementor.modals.createModal( {
			id: 'elementor-introduction',
			contentWidth: 800
		} );

		modal.getComponents( 'closeButton' ).on( 'click', function() {
			self.setIntroductionViewed();

			self.getInfoDialog().show();
		} );

		modal.addButton( {
			name: 'show-later',
			text: elementor.translate( 'Show Me Later' ),
			callback: modal.hide
		} );
	};

	var initInfoDialog = function() {
		infoDialog = elementor.dialogsManager.createWidget( 'alert' );

		infoDialog.setMessage( elementor.translate( 'You can always show this introduction again' ) );
	};

	this.getModal = function() {
		if ( ! modal ) {
			initModal();
		}

		return modal;
	};

	this.getInfoDialog = function() {
		if ( ! infoDialog ) {
			initInfoDialog();
		}

		return infoDialog;
	};

	this.startIntroduction = function() {
		var introductionConfig = elementor.config.introduction;

		if ( ! introductionConfig ) {
			return;
		}

		this.getModal()
		    .setHeaderMessage( introductionConfig.title )
		    .setMessage( introductionConfig.content )
		    .show();
	};

	this.setIntroductionViewed = function() {
		Backbone.$.ajax( {
			type: 'POST',
			url: elementor.config.ajaxurl,
			data: {
				action: 'elementor_introduction_viewed'
			}
		} );
	};
};

module.exports = new Introduction();
