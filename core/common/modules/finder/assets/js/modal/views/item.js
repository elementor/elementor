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

	replaceLockLinkPlaceholders( link ) {
		return link
			.replace( /%%utm_source%%/g, 'finder' )
			.replace( /%%utm_medium%%/g, 'wp-dash' );
	}
}
