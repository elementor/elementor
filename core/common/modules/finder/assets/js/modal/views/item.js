export default class extends Marionette.ItemView {
	className() {
		return 'elementor-finder__results__item';
	}

	getTemplate() {
		return '#tmpl-elementor-finder__results__item';
	}

	events() {
		this.$el[ 0 ].addEventListener( 'click', this.onClick.bind( this ), true );
	}

	onClick( e ) {
		const lockOptions = this.model.get( 'lock' );

		this.trackResultSelect();

		if ( ! lockOptions?.is_locked ) {
			return;
		}

		e.preventDefault();
		e.stopImmediatePropagation();

		elementorCommon.dialogsManager.createWidget( 'confirm', {
			id: 'elementor-finder__lock-dialog',
			headerMessage: lockOptions.content.heading,
			message: lockOptions.content.description,
			position: {
				my: 'center center',
				at: 'center center',
			},
			strings: {
				confirm: lockOptions.button.text,
				cancel: __( 'Cancel', 'elementor' ),
			},
			onConfirm: () => {
				const link = this.replaceLockLinkPlaceholders( lockOptions.button.url );

				window.open( link, '_blank' );
			},
		} ).show();
	}

	trackResultSelect() {
		const config = elementorCommon?.eventsManager?.config;
		const title = this.model.get( 'title' ) || this.model.get( 'name' ) || '';

		elementorCommon?.eventsManager?.dispatchEvent?.( config?.names?.editorOne?.finderResultSelect, {
			app_type: config?.appTypes?.editor,
			window_name: config?.appTypes?.editor,
			interaction_type: config?.triggers?.click,
			target_type: config?.targetTypes?.searchResult,
			target_name: title,
			interaction_result: config?.interactionResults?.selected,
			target_location: config?.locations?.topBar,
			location_l1: config?.secondaryLocations?.finder,
			location_l2: config?.secondaryLocations?.finderResults,
			interaction_description: 'Finder search results was selected',
		} );
	}

	replaceLockLinkPlaceholders( link ) {
		return link
			.replace( /%%utm_source%%/g, 'finder' )
			.replace( /%%utm_medium%%/g, 'wp-dash' );
	}
}
