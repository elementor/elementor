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
		return 'Styles';
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

			$e.run( 'document/atomic-widgets/styles', {
				container,
				styles: isRedo ? changes.new : changes.old,
			} );
		} );
	}

	/**
	 * Function addToHistory().
	 *
	 * @param {Container} container
	 * @param {{}}        newStyles
	 * @param {{}}        oldStyles
	 */
	addToHistory( container, newStyles, oldStyles ) {
		const changes = {
				[ container.id ]: {
					old: oldStyles,
					new: newStyles,
				},
			},
			historyItem = {
				containers: [ container ],
				data: { changes },
				type: 'change',
				restore: Styles.restore,
			};

		$e.internal( 'document/history/add-transaction', historyItem );
	}

	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentConstructor( 'styles', Object, args );

		if ( 0 === Object.keys( args.styles.props ).length ) {
			throw new Error( 'Style properties are empty' );
		}

		if ( ! args.styles.meta || ! ( 'breakpoint' in args.styles.meta && 'state' in args.styles.meta ) ) {
			throw new Error( 'Style meta is invalid' );
		}

		if ( ! args.bind ) {
			throw new Error( 'Style bind is invalid' );
		}
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

	getVariantByMeta( styles, meta ) {
		if ( ! styles.variants ) {
			return;
		}

		return styles.variants.find( ( variant ) => {
			return variant.meta.breakpoint === meta.breakpoint && variant.meta.state === meta.state;
		} );
	}

	createStyleObject( container, styles, bind ) {
		const newId = this.randomId( container.id );

		const newStyles = {
			id: newId,
			label: '',
			type: 'class',
			variants: [
				{
					meta: styles.meta,
					props: styles.props,
				},
			],
		};

		$e.internal( 'document/elements/set-settings', {
			container,
			options: {
				render: false,
			},
			settings: {
				[ bind ]: {
					$$type: 'classes',
					value: [ newId ],
				},
			},
		} );

		return newStyles;
	}

	randomId( prefix ) {
		return `s-${ prefix }-${ Math.random().toString( 16 ).substring( 2 ) }`;
	}

	apply( args ) {
		const { containers = [ args.container ], bind, styles = {} } = args;

		containers.forEach( ( container ) => {
			container = container.lookup();

			let newStyles = {};
			const oldStyles = container.model.get( 'styles' ) || {};
			const existingVariant = this.getVariantByMeta( oldStyles, styles.meta );

			if ( existingVariant ) {
				existingVariant.props = {
					...existingVariant.props,
					...styles.props,
				};

				newStyles = {
					...oldStyles,
					variants: oldStyles.variants.map( ( variant ) =>
						variant.meta === existingVariant.meta ? existingVariant : variant,
					),
				};
			} else {
				newStyles = this.createStyleObject( container, styles, bind );
			}

			// If history active, add history transaction with old and new styles.
			if ( this.isHistoryActive() ) {
				this.addToHistory( container, newStyles, oldStyles );
			}

			container.model.set( 'styles', newStyles );
		} );
	}
}

export default Styles;
