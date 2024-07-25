/**
 * @typedef {import('../../../container/container')} Container
 */
export class CreateVariant extends $e.modules.editor.document.CommandHistoryDebounceBase {
	/**
	 * Function getSubTitle().
	 *
	 * Get sub title by container.
	 *
	 * @return {string} sub title
	 */
	static getSubTitle() {
		return __( 'Styles', 'elementor' );
	}

	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentConstructor( 'styleDefId', String, args );

		this.requireArgumentConstructor( 'meta', Object, args );

		if ( ! ( 'breakpoint' in args.meta && 'state' in args.meta ) ) {
			throw new Error( 'Meta is invalid' );
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
		const data = historyItem.get( 'data' );

		historyItem.get( 'containers' ).forEach( ( /* Container */ container ) => {
			const changes = data.changes[ container.id ];

			if ( isRedo ) {
				$e.run( 'document/atomic-widgets/create-variant', {
					container,
					styleDefId: changes.styleDefId,
					meta: changes.meta,
				} );
			} else {
				$e.run( 'document/atomic-widgets/delete-variant', {
					container,
					styleDefId: changes.styleDefId,
					meta: changes.meta,
				} );
			}
		} );
	}

	/**
	 * Function addToHistory().
	 *
	 * @param {Container} container
	 * @param             styleDefId
	 * @param {{}}        meta
	 */
	addToHistory( container, styleDefId, meta ) {
		const changes = {
				[ container.id ]: {
					styleDefId,
					meta,
				},
			},
			historyItem = {
				containers: [ container ],
				data: { changes },
				type: 'change',
				restore: CreateVariant.restore,
			};

		$e.internal( 'document/history/add-transaction', historyItem );
	}

	getHistory( args ) {
		const { containers = [ args.container ] } = args,
			subTitle = this.constructor.getSubTitle( args );

		return {
			containers,
			subTitle,
			type: 'change',
		};
	}

	getVariantByMeta( variants, meta ) {
		return variants.find( ( variant ) => {
			return variant.meta.breakpoint === meta.breakpoint && variant.meta.state === meta.state;
		} );
	}

	apply( args ) {
		const { container, styleDefId, meta } = args;

		const oldStyles = container.model.get( 'styles' ) || {};
		let style = {};

		if ( ! oldStyles[ styleDefId ] ) {
			throw new Error( 'Style Def not found' );
		}

		style = { ...oldStyles[ styleDefId ] };

		const existingVariant = this.getVariantByMeta( style.variants, meta );

		if ( existingVariant ) {
			throw new Error( 'Style Variant already exits' );
		}

		style = {
			...style,
			variants: [
				...style.variants,
				{
					meta,
					props: {},
				},
			],
		};

		const newStyles = {
			...oldStyles,
			[ style.id ]: style,
		};

		container.model.set( 'styles', newStyles );

		if ( this.isHistoryActive() ) {
			this.addToHistory( container, styleDefId, meta );
		}
	}
}

export default CreateVariant;
