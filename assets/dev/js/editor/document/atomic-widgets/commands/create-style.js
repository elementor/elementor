/**
 * @typedef {import('../../../container/container')} Container
 */
export class CreateStyle extends $e.modules.editor.document.CommandHistoryDebounceBase {
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

			container.model.set( 'styles', isRedo ? changes.newStyles : changes.oldStyles );

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
	 * @param {{}}        oldStyles
	 * @param {{}}        newStyles
	 * @param {{}}        oldSettings
	 * @param {{}}        newSettings
	 */
	addToHistory( container, oldStyles, newStyles, oldSettings, newSettings ) {
		const changes = {
				[ container.id ]: {
					oldStyles,
					newStyles,
					oldSettings,
					newSettings,
				},
			},
			historyItem = {
				containers: [ container ],
				data: { changes },
				type: 'change',
				restore: CreateStyle.restore,
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

	randomId( containerId ) {
		return `s-${ containerId }-${ Math.random().toString( 16 ).substring( 2 ) }`;
	}

	apply( args ) {
		const { container, bind } = args;

		const newStyle = {
			id: this.randomId( container.id ),
			label: '',
			type: 'class',
			variants: [],
		};

		const $$type = 'classes'; // TODO: Style Transformer should be used here.

		const oldBindSetting = container.model.get( 'settings' )?.get( bind ) ?? {
			$$type,
			value: [],
		};

		const newSettings = {
			[ bind ]: {
				$$type: oldBindSetting.$$type,
				value: [ ...oldBindSetting.value, newStyle.id ],
			},
		};

		$e.internal( 'document/elements/set-settings', {
			container,
			options: {
				render: false,
			},
			settings: newSettings,
		} );

		const oldStyles = container.model.get( 'styles' ) || {};

		const newStyles = {
			...oldStyles,
			[ newStyle.id ]: newStyle,
		};

		container.model.set( 'styles', newStyles );

		if ( this.isHistoryActive() ) {
			this.addToHistory(
				container,
				oldStyles,
				newStyles,
				{ [ bind ]: oldBindSetting },
				newSettings,
			);
		}
	}
}

export default CreateStyle;
