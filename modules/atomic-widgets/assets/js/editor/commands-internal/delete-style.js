/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */
export class DeleteStyle extends $e.modules.editor.CommandContainerInternalBase {
	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentConstructor( 'styleDefID', String, args );

		this.requireArgumentConstructor( 'bind', String, args );
	}

	apply( args ) {
		const { container, styleDefID, bind } = args;

		const oldBindSetting = container.settings.get( bind );

		if ( ! oldBindSetting ) {
			throw new Error( 'Setting not found' );
		}

		const newBindSetting = {
			[ bind ]: {
				$$type: 'classes',
				value: oldBindSetting.value.filter( ( id ) => id !== styleDefID ),
			},
		};

		$e.internal( 'document/elements/set-settings', {
			container,
			settings: newBindSetting,
		} );

		const styles = container.model.get( 'styles' ) || {};

		delete styles[ styleDefID ];

		container.model.set( 'styles', styles );
	}
}

export default DeleteStyle;
