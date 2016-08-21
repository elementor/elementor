module.exports = function( $ ) {
	var $this = $( this ),
		defaultActiveSection = $this.find( '.elementor-accordion' ).data( 'active-section' ),
		$accordionTitles = $this.find( '.elementor-accordion-title' ),
		$activeTitle = $accordionTitles.filter( '.active' );

	var activateSection = function( sectionIndex ) {
		var $requestedTitle = $accordionTitles.filter( '[data-section="' + sectionIndex + '"]' ),
			isRequestedActive = $requestedTitle.hasClass( 'active' );

		$activeTitle
			.removeClass( 'active' )
			.next()
			.slideUp();

		if ( ! isRequestedActive ) {
			$requestedTitle
				.addClass( 'active' )
				.next()
				.slideDown();

			$activeTitle = $requestedTitle;
		}
	};

	if ( ! defaultActiveSection ) {
		defaultActiveSection = 1;
	}

	activateSection( defaultActiveSection );

	$accordionTitles.on( 'click', function() {
		activateSection( this.dataset.section );
	} );
};
