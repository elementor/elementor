export const Save = () => {
	QUnit.module( 'Save', ( hooks ) => {
		QUnit.test( 'Simple', async ( assert ) => {
			$e.hooks.deactivate();

			const response = await $e.internal( 'document/save/save' );

			$e.hooks.activate();

			assert.equal( response.data.status, 'draft', 'The response status is: "draft"' );
		} );
	} );
};

export default Save;
