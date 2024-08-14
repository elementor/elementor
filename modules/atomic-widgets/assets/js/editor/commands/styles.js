import { getVariantByMeta } from '../utils/get-variants';

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
		const {
			bind,
			styleDefID,
			meta,
		} = changes;
		const { props } = isRedo ? changes.new : changes.old;

		$e.run( 'document/atomic-widgets/styles', {
			container,
			bind,
			styleDefID,
			meta,
			props,
		} );
	}

	/**
	 * Function addToHistory().
	 *
	 * @param {Container} container
	 * @param {string}    bind
	 * @param {string}    styleDefID
	 * @param {{}}        meta
	 * @param {{}}        props
	 * @param {{}}        oldProps
	 * @param {{}}        oldSettings
	 * @param {{}}        newSettings
	 */
	addToHistory(
		container,
		bind,
		styleDefID,
		meta,
		props,
		oldProps,
		oldSettings,
		newSettings,
	) {
		const newPropsEmpty = Object.keys( props ).reduce( ( emptyValues, key ) => {
			emptyValues[ key ] = undefined;
			return emptyValues;
		}, {} );
		const changes = {
				[ container.id ]: {
					bind,
					styleDefID,
					meta,
					old: {
						settings: oldSettings,
						props: { ...newPropsEmpty, ...oldProps },
					},
					new: {
						settings: newSettings,
						props,
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

	apply( args ) {
		let { container } = args;
		const { bind, meta, props } = args;
		container = container.lookup();

		const initialStyleDefID = args.styleDefID;
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
		} else if ( ! oldStyles[ styleDefID ] ) {
			style = $e.internal( 'document/atomic-widgets/create-style', {
				container,
				styleDefID,
				bind,
			} );
			// Throw new Error( 'Style Def not found' );
		} else {
			style = oldStyles[ styleDefID ];
		}

		if ( ! getVariantByMeta( style.variants, meta ) ) {
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
			const oldStyleDef = initialStyleDefID ? oldStyles[ initialStyleDefID ] : undefined;
			const oldProps = oldStyleDef?.variants ? getVariantByMeta( oldStyleDef.variants, meta )?.props : {};
			const newBindSetting = container.settings.get( bind );

			const oldSettings = {
				[ bind ]: oldBindSetting ?? null,
			};

			const newSettings = {
				[ bind ]: newBindSetting,
			};

			this.addToHistory(
				container,
				bind,
				styleDefID,
				meta,
				props,
				oldProps,
				oldSettings,
				newSettings,
			);
		}
	}
}

export default Styles;
