/**
 * @typedef {import('../../../container/container')} Container
 */
export class UpdateProps extends $e.modules.editor.document.CommandHistoryDebounceBase {
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

			$e.run( 'document/atomic-widgets/update-props', {
				container,
				styleDefId: changes.styleDefId,
				meta: changes.meta,
				props: isRedo ? changes.props : changes.oldProps,
			} );
		} );
	}

	/**
	 * Function addToHistory().
	 *
	 * @param {Container} container
	 * @param {string}    styleDefId
	 * @param {{}}        meta
	 * @param {{}}        props
	 * @param {{}}        oldProps
	 */
	addToHistory( container, styleDefId, meta, props, oldProps ) {
		const changes = {
				[ container.id ]: {
					styleDefId,
					meta,
					props,
					oldProps,
				},
			},
			historyItem = {
				containers: [ container ],
				data: { changes },
				type: 'change',
				restore: UpdateProps.restore,
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

	apply( args ) {
		const { container, styleDefId, meta, props } = args;

		const propsSnapshot = {};
		const oldStyles = container.model.get( 'styles' ) || {};
		let style = {};

		if ( ! oldStyles[ styleDefId ] ) {
			throw new Error( 'Style Def not found' );
		}

		style = { ...oldStyles[ styleDefId ] };

		const variant = this.getVariantByMeta( style.variants, meta );

		if ( ! variant ) {
			throw new Error( 'Style Variant not found' );
		}

		// Save the old values of the props
		if ( this.isHistoryActive() ) {
			Object.keys( props ).forEach( ( prop ) => {
				propsSnapshot[ prop ] = variant.props[ prop ] || null;
			} );
		}

		style = this.updateExistingVariant( style, variant, props );

		const newStyles = {
			...oldStyles,
			[ style.id ]: style,
		};

		container.model.set( 'styles', newStyles );

		if ( this.isHistoryActive() ) {
			this.addToHistory( container, styleDefId, meta, props, propsSnapshot );
		}
	}
}

export default UpdateProps;
