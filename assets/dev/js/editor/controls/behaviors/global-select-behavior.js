export default class GlobalControlSelect extends Marionette.Behavior {
	ui() {
		return {
			controlContent: '.elementor-control-content',
			globalControlSelect: '.elementor-global-select',
			globalControlSelected: '.elementor-global-selected',
		};
	}

	events() {
		return {
			'click @ui.globalControlSelect': 'toggleSelect',
		};
	}

	// The Global Control elements are initialized onRender and not with initialize() because their position depends
	// on elements that are not yet rendered when initialize() is called.
	onRender() {
		this.printGlobalSelectBox();
		this.initGlobalPopover();
		this.$el.addClass( 'elementor-control-global' );
	}

	toggleSelect() {
		const visible = this.popover.isVisible();

		if ( visible ) {
			this.popover.hide();
		} else {
			this.popover.show();
		}
	}

	buildGlobalPopover() {
		const $popover = jQuery( '<div>', { class: 'elementor-global-popover-container' } ),
			$popoverTitle = jQuery( '<div>', { class: 'elementor-global-popover-title' } )
				.html( '<i class="eicon-info-circle"></i>Global Colors' ),
			$manageGlobalPresetsLink = jQuery( '<div>', { class: 'elementor-global-manage-button' } )
				.html( 'Manage Color Styles<i class="eicon-cog"></i>' );

		$popover.append( $popoverTitle, this.getOption( 'popoverContent' ), $manageGlobalPresetsLink );

		return $popover;
	}

	printGlobalSelectBox() {
		const $globalSelectBox = jQuery( '<div>', { class: 'elementor-global-select' } ),
			$selectedGlobal = jQuery( '<span>', { class: 'elementor-global-selected' } )
				.html( 'Global' );

		$globalSelectBox.append( $selectedGlobal, '<i class="eicon-caret-down"></i>' );

		this.$el.find( '.elementor-control-input-wrapper' ).prepend( $globalSelectBox );
	}

	initGlobalPopover() {
		this.popover = elementorCommon.dialogsManager.createWidget( 'simple', {
			className: 'elementor-global-control-popover',
			message: this.buildGlobalPopover(),
			effects: {
				show: 'show',
				hide: 'hide',
			},
			position: {
				my: `center top`,
				at: `center bottom+5`,
				of: this.ui.controlContent,
				autoRefresh: true,
			},
		} );

		this.popover.getElements( 'widget' ).find( '.elementor-global-preview' ).on( 'click', ( event ) => {
			const previewData = event.currentTarget.dataset;

			this.ui.globalControlSelected.html( previewData[ 'elementor-global-name' ] );
		} );
	}
}
