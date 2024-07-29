import { __ } from '@wordpress/i18n';

/**
 * @typedef {import('../../../container/container')} Container
 */
export class Styles extends $e.modules.editor.document.CommandHistoryDebounceBase {
	/**
	 * Function getSubTitle().
	 *
	 * Get sub title by container.
	 *
	 * @return {string} sub title
	 */
	static getSubTitle() {
		return __( 'Style', 'elementor' );
	}

	validateArgs( args ) {
		this.requireContainer( args );

		// Bind or StyleDefId
		// this.requireArgumentConstructor( 'bind', String, args );
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

	getVariantByMeta( variants, meta ) {
		return variants.find( ( variant ) => {
			return variant.meta.breakpoint === meta.breakpoint && variant.meta.state === meta.state;
		} );
	}

	async apply( args ) {
		const { container, styleDefId, bind, meta, props } = args;
		const oldStyles = container.model.get( 'styles' ) ?? {};
		const oldBindSetting = container.settings.get( bind );
		let currentStyleDefId = styleDefId;
		let style = {};

		if ( ! styleDefId ) {
			style = await $e.internal( 'document/atomic-widgets/create-style', {
				container,
				bind,
			} );

			currentStyleDefId = style.id;
		} else {
			if ( ! oldStyles[ styleDefId ] ) {
				throw new Error( 'Style Def not found' );
			}

			style = oldStyles[ styleDefId ];
		}

		const variant = this.getVariantByMeta( style.variants, meta );

		if ( ! variant ) {
			$e.internal( 'document/atomic-widgets/create-variant', {
				container,
				styleDefId: currentStyleDefId,
				meta,
			} );
		}

		$e.internal( 'document/atomic-widgets/update-props', {
			container,
			styleDefId: currentStyleDefId,
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
