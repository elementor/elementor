/**
 * @typedef {import('../../../container/container')} Container
 */
export class DeleteStyle extends $e.modules.editor.document.CommandHistoryDebounceBase {
	/**
	 * Function getSubTitle().
	 *
	 * Get sub title by container.
	 *
	 * @return {string} sub title
	 */
	static getSubTitle() {
		return __( 'Style Def', 'elementor' );
	}

	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentConstructor( 'styleDefId', String, args );

		this.requireArgumentConstructor( 'bind', String, args );
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
				$e.run( 'document/atomic-widgets/delete-style', {
					container,
					styleDefId: changes.styleDefId,
					bind: changes.bind,
				} );
			} else {
				$e.run( 'document/atomic-widgets/create-style', {
					container,
					bind: changes.bind,
				} );
			}
		} );
	}

	/**
	 * Function addToHistory().
	 *
	 * @param {Container} container
	 * @param {string}    styleDefId
	 * @param {string}    bind
	 */
	addToHistory( container, styleDefId, bind ) {
		const changes = {
				[ container.id ]: {
					styleDefId,
					bind,
				},
			},
			historyItem = {
				containers: [ container ],
				data: { changes },
				type: 'remove',
				restore: DeleteStyle.restore,
			};

		$e.internal( 'document/history/add-transaction', historyItem );
	}

	getHistory( args ) {
		const { containers = [ args.container ] } = args,
			subTitle = this.constructor.getSubTitle( args );

		return {
			containers,
			subTitle,
			type: 'remove',
		};
	}

	apply( args ) {
		const { container, styleDefId, bind } = args;

		const settings = container.settings.toJSON();

		settings[ bind ].value = settings[ bind ].value.filter( ( styleId ) => styleId !== styleDefId );

		$e.internal( 'document/elements/set-settings', {
			container,
			options: {
				render: false,
			},
			settings: {
				[ bind ]: settings[ bind ],
			},
		} );

		const styles = container.model.get( 'styles' ) || {};

		delete styles[ styleDefId ];

		container.model.set( 'styles', styles );

		if ( this.isHistoryActive() ) {
			this.addToHistory( container, styleDefId, bind );
		}
	}
}

export default DeleteStyle;
