/**
 * @typedef {import('../../../container/container')} Container
 */
export class Styles extends $e.modules.editor.document.CommandHistoryDebounceBase {
	changes = {};

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

			$e.internal( 'document/atomic-widgets/set-styles', {
				container,
				styles: isRedo ? changes.newStyles : changes.oldStyles,
			} );

			$e.internal( 'document/elements/set-settings', {
				container,
				options: {
					render: false,
				},
				settings: isRedo ? changes.newSettings : changes.oldSettings,
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
					oldStyles,
					newStyles,
					oldSettings: this.changes.oldSettings ?? {},
					newSettings: this.changes.newSettings ?? {},
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

		this.requireArgumentConstructor( 'meta', Object, args );

		this.requireArgumentConstructor( 'props', Object, args );

		this.requireArgumentConstructor( 'bind', String, args );

		if ( 0 === Object.keys( args.props ).length ) {
			throw new Error( 'Props are empty' );
		}

		if ( ! args.meta || ! ( 'breakpoint' in args.meta && 'state' in args.meta ) ) {
			throw new Error( 'Meta are invalid' );
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

	createNewStyleObject( container, bind ) {
		const newId = this.randomId( container.id );

		const newStyles = {
			id: newId,
			label: '',
			type: 'class',
			variants: [],
		};

		const oldSettings = container.model.get( 'settings' ),
			oldValue = oldSettings?.get( bind )?.value || [];

		const newSettings = {
			[ bind ]: {
				$$type: 'classes',
				value: [ ...oldValue, newId ],
			},
		};

		$e.internal( 'document/elements/set-settings', {
			container,
			options: {
				render: false,
			},
			settings: newSettings,
		} );

		this.changes.newSettings = newSettings;
		this.changes.oldSettings = oldSettings;

		return newStyles;
	}

	getVariantByMeta( style, meta ) {
		if ( ! style.variants ) {
			return;
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

	randomId( prefix ) {
		return `s-${ prefix }-${ Math.random().toString( 16 ).substring( 2 ) }`;
	}

	apply( args ) {
		const { containers = [ args.container ], styleDefId, bind, meta, props } = args;

		// TODO: support multiple containers?!
		containers.forEach( ( container ) => {
			const oldStyles = container.model.get( 'styles' ) || {};
			let managedStyle = {};

			if ( ! oldStyles?.[ styleDefId ] ) {
				managedStyle = this.createNewStyleObject( container, bind );

				// Pass the created ID to the args by reference.
				args.styleDefId = managedStyle.id;
			} else {
				managedStyle = oldStyles[ styleDefId ];
			}

			const existingVariant = this.getVariantByMeta( managedStyle, meta );

			if ( existingVariant ) {
				managedStyle = this.updateExistingVariant( managedStyle, existingVariant, props );
			} else {
				managedStyle = this.addNewVariant( managedStyle, meta, props );
			}

			const newStyles = {
				...oldStyles,
				[ managedStyle.id ]: managedStyle,
			};

			// If history active, add history transaction with old and new styles.
			if ( this.isHistoryActive() ) {
				this.addToHistory( container, newStyles, oldStyles );
			}

			$e.internal( 'document/atomic-widgets/set-styles', {
				container,
				styles: newStyles,
			} );
		} );
	}
}

export default Styles;
