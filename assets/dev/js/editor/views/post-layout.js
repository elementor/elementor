const PostLayout = {
	init() {
		this.runActions();
	},

	runActions() {
		Object.entries( this.actions() ).forEach( ( action ) => {
			const [ key, triggers ] = action;
			const $elements = elementorFrontend.elements.$document.find( this.elements()[ key ] );

			if ( ! $elements.length ) {
				return;
			}

			Object.entries( triggers ).forEach( ( triggerEntry ) => {
				const [ trigger, callback ] = triggerEntry;

				$elements.each( ( index, $element ) => {
					jQuery( $element ).on( trigger, () => {
						jQuery( $element ).attr( 'data-e-post-layout', trigger );
						if ( 'function' === typeof this[ callback ] ) {
							this[ callback ]();
						}
					} );
				} );
			} );
		} );
	},

	elements() {
		return {
			pageTitle: elementor.config.page_title_selector,
		};
	},

	actions() {
		return {
			pageTitle: {
				click: 'onPageTitleClick',
			},
		};
	},

	onPageTitleClick() {
		if ( $e.routes.getCurrent( 'panel' ).includes( 'panel/global' ) ) {
			return;
		}

		$e.route( 'panel/page-settings/settings' );
	},
};

export default PostLayout;
