/**
 * @typedef {import('../../../container/container')} Container
 */
export class DeleteStyle extends $e.modules.editor.CommandContainerInternalBase {
	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentConstructor( 'styleDefId', String, args );

		this.requireArgumentConstructor( 'bind', String, args );
	}

	apply( args ) {
		const { container, styleDefId, bind } = args;

		const setting = container.settings.get( bind );

		if ( ! setting ) {
			throw new Error( 'Setting not found' );
		}

		if ( ! setting.value.includes( styleDefId ) ) {
			throw new Error( 'Style Def not found in setting' );
		}

		const settings = {
			[ bind ]: {
				$$type: 'classes',
				value: setting.value.filter( ( id ) => id !== styleDefId ),
			},
		};

		$e.internal( 'document/elements/set-settings', {
			container,
			options: {
				render: false,
			},
			settings,
		} );

		const styles = container.model.get( 'styles' ) || {};

		delete styles[ styleDefId ];

		container.model.set( 'styles', styles );
	}
}

export default DeleteStyle;
