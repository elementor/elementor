var Introduction;

Introduction = function() {
	var self = this,
		modal,
		infoDialog;

	var initModal = function() {
		modal = elementor.modals.createModal( {
			id: 'elementor-introduction',
			contentWidth: 700
		} );

		modal.getComponents( 'closeButton' ).on( 'click', function() {
			self.setIntroductionViewed();
		} );

		modal.on( 'hide', function() {
			modal.getComponents( 'message' ).empty(); // In order to stop the video
		} );
	};

	this.getSettings = function() {
		return elementor.config.introduction;
	};

	this.getModal = function() {
		if ( ! modal ) {
			initModal();
		}

		return modal;
	};

	this.startIntroduction = function() {
		var settings = this.getSettings();

		this.getModal()
		    .setHeaderMessage( settings.title )
		    .setMessage( settings.content )
		    .show();
	};

	this.startOnLoadIntroduction = function() {
		var settings = this.getSettings();

		if ( ! settings.is_user_should_view ) {
			return;
		}

		setTimeout( _.bind( function() {
			this.startIntroduction();
		}, this ), settings.delay );
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
