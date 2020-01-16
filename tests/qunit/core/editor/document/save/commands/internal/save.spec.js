export const Save = () => {
	QUnit.module( 'Save', () => {
		QUnit.test( 'Simple', async ( assert ) => {
			$e.internal( 'document/save/set-is-modified', { status: true } );

			$e.hooks.deactivate();

			const response = await $e.internal( 'document/save/save' );

			$e.hooks.activate();

			assert.equal( $e.components.get( 'document/save' ).isEditorChanged(), false,
				'Editor saver flag set to be: "false" after successfully save' );
			assert.equal( response.data.status, 'draft', 'The response status is: "draft"' );
		} );
	} );
};

export default Save;
