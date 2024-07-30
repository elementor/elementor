/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */
export class DeleteStyle extends $e.modules.editor.CommandContainerInternalBase {
	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentConstructor( 'styleDefId', String, args );

		this.requireArgumentConstructor( 'bind', String, args );
	}

	apply( args ) {
		const { container, styleDefId, bind } = args;

		const oldBindSetting = container.settings.get( bind );

		if ( ! oldBindSetting ) {
			throw new Error( 'Setting not found' );
		}

		const newBindSetting = {
			[ bind ]: {
				$$type: 'classes',
				value: oldBindSetting.value.filter( ( id ) => id !== styleDefId ),
			},
		};

		$e.internal( 'document/elements/set-settings', {
			container,
			options: {
				render: false,
			},
			settings: newBindSetting,
		} );

		const styles = container.model.get( 'styles' ) || {};

		delete styles[ styleDefId ];

		container.model.set( 'styles', styles );
	}
}

export default DeleteStyle;
