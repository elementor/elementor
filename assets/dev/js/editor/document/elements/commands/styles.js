/**
 * @typedef {import('../../../container/container')} Container
 */
export class Styles extends $e.modules.editor.document.CommandHistoryDebounceBase {
	/**
	 * Function getSubTitle().
	 *
	 * Get sub title by container.
	 *
	 * @param {{}} args
	 *
	 * @return {string} sub title
	 */
	static getSubTitle() {
		// TODO - temp title, need to decide on the proper data structure to pass
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

			$e.run( 'document/elements/styles', {
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

	apply( args ) {
		const { containers = [ args.container ], styles = {}, options = {} } = args;

		containers.forEach( ( container ) => {
			container = container.lookup();

			const newStyles = styles,
				oldStyles = container.model.get( 'styles' );

			// Clear old oldValues.
			container.oldValues = {};

			// Set oldValues, For each setting is about to change save setting value.
			Object.keys( newStyles ).forEach( ( key ) => {
				container.oldValues[ key ] = oldStyles[ key ];
			} );

			// If history active, add history transaction with old and new styles.
			if ( this.isHistoryActive() ) {
				this.addToHistory( container, newStyles, container.oldValues );
			}

			$e.internal( 'document/elements/set-styles', {
				container,
				options,
				styles: newStyles,
			} );
		} );
	}
}

export default Styles;
