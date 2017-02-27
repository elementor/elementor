module.exports = function( $ ) {
	$( '.elementor_under_construction_mode select' ).change( function( event ) {
		event.preventDefault();
		var $this = $( this );

		$this.parents( 'table' ).toggleClass( 'elementor-under-construction-is-enabled', '' !== $this.val() );
	} ).change();

	$( '.elementor_under_construction_exclude_mode select' ).change( function( event ) {
		event.preventDefault();
		var $this = $( this );

		$( '.elementor_under_construction_exclude_roles' ).toggle( 'custom' === $this.val() );
	} ).change();

	$( '.elementor_under_construction_template_id select' ).change( function() {
		var $this = $( this ),
			templateID = $this.val(),
			$editButton = $this.parents( 'tr' ).find( '.elementor-edit-template' );

		if ( ! templateID ) {
			$editButton.hide();
			return;
		}

		var editUrl = ElementorConfig.home_url + '?p=' + templateID + '&elementor';

		$editButton
			.prop( 'href', editUrl )
			.show();
	} ).change();
};
