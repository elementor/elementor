export const Save = () => {
	QUnit.module( 'Save', ( hooks ) => {
		QUnit.test( 'Simple', async ( assert ) => {
			const response = await $e.internal( 'document/save/save' );

			assert.equal( response.data.status, 'draft', 'The response status is: "draft"' );
		} );
	} );
};

export default Save;
