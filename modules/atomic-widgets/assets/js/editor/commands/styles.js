/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */
export class Styles extends $e.modules.editor.document.CommandHistoryDebounceBase {
	static getSubTitle() {
		return __( 'Style', 'elementor' );
	}

	validateArgs( args ) {
		this.requireContainer( args );

		if ( ! args.bind && ! args.styleDefId ) {
			throw new Error( 'Missing bind or styleDefId' );
		}

		if ( args.bind && 'string' !== typeof args.bind ) {
			throw new Error( 'Invalid bind arg' );
		}

		if ( args.styleDefId && 'string' !== typeof args.styleDefId ) {
			throw new Error( 'Invalid styleDefId arg' );
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
		const changes = historyItem.get( 'data' ).changes;

		$e.internal( 'document/elements/set-settings', {
			container,
			options: {
				render: false,
			},
			settings: isRedo ? changes.newSettings : changes.oldSettings,
		} );

		container.model.set( 'styles', isRedo ? changes.newStyles : changes.oldStyles );
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
				container,
				oldSettings,
				newSettings,
				oldStyles,
				newStyles,
			},
			historyItem = {
				container,
				data: { changes },
				type: 'add',
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
			type: 'add',
		};
	}

	variantExists( style, meta ) {
		return style.variants.some( ( variant ) => {
			return variant.meta.breakpoint === meta.breakpoint && variant.meta.state === meta.state;
		} );
	}

	apply( args ) {
		const { container, bind, meta, props } = args;
		let styleDefId = args.styleDefId ?? null;

		const oldStyles = container.model.get( 'styles' ) ?? {};
		const oldBindSetting = container.settings.get( bind );
		let style = {};

		if ( ! styleDefId ) {
			style = $e.internal( 'document/atomic-widgets/create-style', {
				container,
				bind,
			} );

			styleDefId = style.id;
		} else {
			if ( ! oldStyles[ styleDefId ] ) {
				throw new Error( 'Style Def not found' );
			}

			style = oldStyles[ styleDefId ];
		}

		if ( ! this.variantExists( style, meta ) ) {
			$e.internal( 'document/atomic-widgets/create-variant', {
				container,
				styleDefId,
				meta,
			} );
		}

		$e.internal( 'document/atomic-widgets/update-props', {
			container,
			styleDefId,
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
