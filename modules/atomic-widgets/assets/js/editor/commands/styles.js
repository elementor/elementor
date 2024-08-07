/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */
export class Styles extends $e.modules.editor.document.CommandHistoryDebounceBase {
	static getSubTitle() {
		return __( 'Style', 'elementor' );
	}

	validateArgs( args ) {
		this.requireContainer( args );

		if ( ! args.bind && ! args.styleDefID ) {
			throw new Error( 'Missing bind or styleDefID' );
		}

		if ( args.bind && 'string' !== typeof args.bind ) {
			throw new Error( 'Invalid bind arg' );
		}

		if ( args.styleDefID && 'string' !== typeof args.styleDefID ) {
			throw new Error( 'Invalid styleDefID arg' );
		}
	}

	/**
	 * Function restore().
	 *
	 * Redo/Restore.
	 *
	 * @param {{}}      historyItem
	 * @param {boolean} isRedo
	 */
	static restore( historyItem, isRedo ) {
		const container = historyItem.get( 'container' );
		const changes = historyItem.get( 'data' ).changes[ container.id ];

		$e.internal( 'document/elements/set-settings', {
			container,
			options: {
				render: false,
			},
			settings: isRedo ? changes.new.settings : changes.old.settings,
		} );

		container.model.set( 'styles', isRedo ? changes.new.styles : changes.old.styles );
	}

	/**
	 * Function addToHistory().
	 *
	 * @param {Container} container
	 * @param {{}}        oldSettings
	 * @param {{}}        newSettings
	 * @param {{}}        oldStyles
	 * @param {{}}        newStyles
	 */
	addToHistory( container, oldSettings, newSettings, oldStyles, newStyles ) {
		const changes = {
				[ container.id ]: {
					old: {
						settings: oldSettings,
						styles: oldStyles,
					},
					new: {
						settings: newSettings,
						styles: newStyles,
					},
				},
			},
			historyItem = {
				container,
				data: { changes },
				type: 'change',
				restore: Styles.restore,
			};

		$e.internal( 'document/history/add-transaction', historyItem );
	}

	getHistory( args ) {
		const { container } = args,
			subTitle = this.constructor.getSubTitle( args );

		return {
			container,
			subTitle,
			type: 'change',
		};
	}

	variantExists( style, meta ) {
		return style.variants.some( ( variant ) => {
			return variant.meta.breakpoint === meta.breakpoint && variant.meta.state === meta.state;
		} );
	}

	apply( args ) {
		const { container, bind, meta, props } = args;
		let styleDefID = args.styleDefID ?? null;

		const oldStyles = structuredClone( container.model.get( 'styles' ) ) ?? {};

		const oldBindSetting = container.settings.get( bind );
		let style = {};

		if ( ! styleDefID ) {
			style = $e.internal( 'document/atomic-widgets/create-style', {
				container,
				bind,
			} );

			styleDefID = style.id;
		} else if ( oldStyles[ styleDefID ] ) {
			style = oldStyles[ styleDefID ];
		} else {
			throw new Error( 'Style Def not found' );
		}

		if ( ! this.variantExists( style, meta ) ) {
			$e.internal( 'document/atomic-widgets/create-variant', {
				container,
				styleDefID,
				meta,
			} );
		}

		$e.internal( 'document/atomic-widgets/update-props', {
			container,
			styleDefID,
			bind,
			meta,
			props,
		} );

		if ( this.isHistoryActive() ) {
			const newStyles = container.model.get( 'styles' );
			const newBindSetting = container.settings.get( bind );

			const oldSettings = {
				[ bind ]: oldBindSetting ?? null,
			};

			const newSettings = {
				[ bind ]: newBindSetting,
			};

			this.addToHistory( container, oldSettings, newSettings, oldStyles, newStyles );
		}
	}
}

export default Styles;
