var Introduction;

Introduction = function() {
	var modal;

	var initModal = function() {
		modal = elementor.modals.createModal( {
			id: 'elementor-introduction',
			contentWidth: 800
		} );

		modal.getComponents( 'closeButton' ).on( 'click', self.setIntroductionViewed );
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
