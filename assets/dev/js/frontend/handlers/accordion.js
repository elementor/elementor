var activateTab = function( sectionIndex, $accordionTitles ) {
	var $activeTitle = $accordionTitles.filter( '.active' ),
		$requestedTitle = $accordionTitles.filter( '[data-tab="' + sectionIndex + '"]' ),
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
	}
};

module.exports = function( $scope ) {
	var defaultActiveTab = $scope.find( '.elementor-accordion' ).data( 'active-tab' ),
		$accordionTitles = $scope.find( '.elementor-accordion-title' );

	if ( ! defaultActiveTab ) {
		defaultActiveTab = 1;
	}

	activateTab( defaultActiveTab, $accordionTitles );

	$accordionTitles.on( {
		click: function() {
			this.focus();
		},
		focus: function() {
			activateTab( this.dataset.tab, $accordionTitles );
		}
	} );
};
