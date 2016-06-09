var Introduction;

Introduction = function() {
	var self = this,
		modal;

	var initModal = function() {
		modal = elementor.modals.createModal( {
			id: 'elementor-introduction',
			contentWidth: 800
		} );

		modal.getComponents( 'closeButton' ).on( 'click', self.setIntroductionViewed );

		modal.addButton({
			name: 'show-later',
			text: elementor.translate( 'Show Me Later' ),
			callback: modal.hide
		});
	};

	this.getModal = function() {
		if ( ! modal ) {
			initModal();
		}

		return modal;
	};

	this.startIntroduction = function() {
		var introductionConfig = elementor.config.introduction_video;

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
