export default class ControlsPopover {
	constructor( child ) {
		this.child = child;

		this.groupControlName = child.model.get( 'groupPrefix' ) + 'typography';

		this.$popover = jQuery( '<div>', { class: 'elementor-controls-popover' } );

		child.$el.before( this.$popover );

		this.$popover.append( child.$el );

		if ( 'typography' === this.child.model.attributes.groupType ) {
			// Add the "Typography" header to the popover
			this.createPopoverHeader();
		}
	}

	addChild( child ) {
		this.$popover.append( child.$el );
	}

	createPopoverHeader() {
		const $popoverToggleControl = this.$popover.prev(),
			// Get the existing reset button
			$resetInput = $popoverToggleControl.find( '.elementor-control-popover-toggle-reset' ),
			$resetLabel = $popoverToggleControl.find( '.elementor-control-popover-toggle-reset-label' );

		this.$popoverHeader = jQuery( '<div>', { class: 'e-group-control-header' } )
			.html( '<span>' + elementor.translate( 'typography' ) + '</span>' );

		this.$headerControlsWrapper = jQuery( '<div>', { class: 'e-control-tools' } );

		// Hide the reset "radio button"
		$resetInput.hide();

		// Give the reset button the control tool styling,
		// and add a click event so clicking on it closes the popover
		$resetLabel
			.addClass( 'e-control-tool' )
			.on( 'click', () => this.onResetButtonClick() );

		// Move the popover toggle reset button into the popover header
		this.$headerControlsWrapper.append( $resetInput, $resetLabel );
		this.$popoverHeader.append( this.$headerControlsWrapper );

		this.createAddButton();

		this.$popover
			.prepend( this.$popoverHeader )
			.addClass( 'e-typography-popover' );
	}

	onResetButtonClick() {
		this.$popover.hide();

		const args = {
			container: this.child.options.container,
			settings: { [ this.groupControlName ]: '' },
		};

		if ( this.child.options.container.globals.get( this.groupControlName ) ) {
			// The Disable Globals command applies global settings locally, so disabling the global doesn't actually change the appe.
			$e.run( 'document/globals/disable', args );
		} else {
			$e.run( 'document/elements/settings', args );
		}
	}

	onAddButtonClick() {
		//const popoverToggleView = this.child.options.container.panel.getControlView( this.groupControlName );

		$e.run( 'globals/typography/create', {
			container: this.child.options.container,
			setting: this.groupControlName, // group control name
			title: 'New Style_' + elementor.helpers.getUniqueID(),
		} )
			.then( ( result ) => {
				$e.run( 'document/globals/enable', {
					container: this.child.options.container,
					settings: {
						[ this.groupControlName ]: `globals/typography?id=${ result.data._id }`,
					},
				} );
			} );
	}

	createAddButton() {
		this.$addButton = jQuery( '<button>', { class: 'e-control-tool' } ).html( jQuery( '<i>', { class: 'eicon-plus' } ) );

		this.$headerControlsWrapper.append( this.$addButton );

		this.$addButton.on( 'click', () => this.onAddButtonClick() );

		//this.toggleButtonListener( '$addButton', true );

		this.$addButton.tipsy( {
			title: () => elementor.translate( 'create_global_color' ),
			gravity: () => 's',
		} );
	}
}
