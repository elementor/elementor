/**
 * @typedef {import('../../../container/container')} Container
 */
export class UpdateStyle extends $e.modules.editor.document.CommandHistoryDebounceBase {
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

		this.requireArgumentConstructor( 'props', Object, args );

		if ( ! ( 'breakpoint' in args.meta && 'state' in args.meta ) ) {
			throw new Error( 'Meta is invalid' );
		}

		if ( 0 === Object.keys( args.props ).length ) {
			throw new Error( 'Props are empty' );
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

			container.model.set( 'styles', isRedo ? changes.newStyles : changes.oldStyles );
		} );
	}

	/**
	 * Function addToHistory().
	 *
	 * @param {Container} container
	 * @param {{}}        oldStyles
	 * @param {{}}        newStyles
	 */
	addToHistory( container, oldStyles, newStyles ) {
		const changes = {
				[ container.id ]: {
					oldStyles,
					newStyles,
				},
			},
			historyItem = {
				containers: [ container ],
				data: { changes },
				type: 'change',
				restore: UpdateStyle.restore,
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

	getVariantByMeta( style, meta ) {
		if ( ! style.variants ) {
			return null;
		}

		return style.variants.find( ( variant ) => {
			return variant.meta.breakpoint === meta.breakpoint && variant.meta.state === meta.state;
		} );
	}

	updateExistingVariant( style, existingVariant, props ) {
		existingVariant.props = {
			...existingVariant.props,
			...props,
		};

		return {
			...style,
			variants: style.variants.map( ( variant ) =>
				variant.meta === existingVariant.meta ? existingVariant : variant,
			),
		};
	}

	addNewVariant( style, meta, props ) {
		return {
			...style,
			variants: [
				...style.variants,
				{
					meta,
					props,
				},
			],
		};
	}

	apply( args ) {
		const { container, styleDefId, meta, props } = args;

		const oldStyles = container.model.get( 'styles' ) || {};
		let style = {};

		if ( ! oldStyles[ styleDefId ] ) {
			throw new Error( 'Style Def not found' );
		} else {
			style = { ...oldStyles[ styleDefId ] };
		}

		const existingVariant = this.getVariantByMeta( style, meta );

		if ( existingVariant ) {
			style = this.updateExistingVariant( style, existingVariant, props );
		} else {
			style = this.addNewVariant( style, meta, props );
		}

		const newStyles = {
			...oldStyles,
			[ style.id ]: style,
		};

		container.model.set( 'styles', newStyles );

		if ( this.isHistoryActive() ) {
			this.addToHistory( container, oldStyles, newStyles );
		}
	}
}

export default UpdateStyle;
