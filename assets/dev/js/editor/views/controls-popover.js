export default class ControlsPopover {
	constructor( child ) {
		this.child = child;

		this.$popover = jQuery( '<div>', { class: 'elementor-controls-popover' } );

		child.$el.before( this.$popover );

		this.$popover.append( child.$el );

		this.popoverToggleView = child._parent.children.findByIndex( child._index - 1 );

		// Add the "Typography" header to the popover
		if ( 'typography' === this.child.model.attributes.groupType ) {
			this.createPopoverHeader();
		}
	}

	addChild( child ) {
		this.$popover.append( child.$el );
	}

	createPopoverHeader() {
		const $popoverToggleControl = this.$popover.prev(),
			// Get the existing reset button.
			$resetLabel = $popoverToggleControl.find( '.elementor-control-popover-toggle-reset-label' );

		this.$popoverHeader = jQuery( '<div>', { class: 'e-group-control-header' } )
			.html( '<span>' + __( 'Typography', 'elementor' ) + '</span>' );

		this.$headerControlsWrapper = jQuery( '<div>', { class: 'e-control-tools' } );

		// Give the reset button the control tool styling, and add a click event so clicking on it closes the popover.
		$resetLabel
			.addClass( 'e-control-tool' )
			.on( 'click', () => this.onResetButtonClick() );

		// Move the popover toggle reset button into the popover header.
		this.$headerControlsWrapper.append( $resetLabel );
		this.$popoverHeader.append( this.$headerControlsWrapper );

		const globalConfig = this.popoverToggleView.model.get( 'global' );

		if ( globalConfig?.active ) {
			this.createAddButton();
		}

		this.$popover
			.prepend( this.$popoverHeader )
			.addClass( 'e-controls-popover--typography' );
	}

	onResetButtonClick() {
		this.$popover.hide();

		const groupControlName = this.child.model.get( 'groupPrefix' ) + 'typography',
			args = {
			container: this.child.options.container,
			settings: { [ groupControlName ]: '' },
		};

		if ( this.child.options.container.globals.get( groupControlName ) ) {
			// The Disable Globals command applies global settings locally,
			// so disabling the global shouldn't actually change the appearance of the widget.
			$e.run( 'document/globals/disable', args );
		} else {
			$e.run( 'document/elements/settings', args );
		}
	}

	onAddButtonClick() {
		this.popoverToggleView.onAddGlobalButtonClick();
	}

	createAddButton() {
		this.$addButton = jQuery( '<button>', { class: 'e-control-tool' } ).html( jQuery( '<i>', { class: 'eicon-plus' } ) );

		this.$headerControlsWrapper.append( this.$addButton );

		this.$addButton.on( 'click', () => this.onAddButtonClick() );

		this.$addButton.tipsy( {
			title: () => __( 'Create New Global Font', 'elementor' ),
			gravity: () => 's',
		} );
	}

	destroy() {
		this.$popover.remove();
	}
}
