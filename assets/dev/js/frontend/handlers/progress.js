class Progress extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				progressNumber: '.elementor-progress-bar',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );
		return {
			$progressNumber: this.$element.find( selectors.progressNumber ),
		};
	}

	onInit() {
		super.onInit();

		elementorFrontend.waypoint( this.elements.$progressNumber, function() {
			var $progressbar = jQuery( this );

			$progressbar.css( 'width', $progressbar.data( 'max' ) + '%' );
		} );
	}
}

module.exports = ( $scope ) => {
	new Progress( {
		$element: $scope,
	} );
};

// TODO: change the call to this widget in elements-handler.js?
