export const Publish = () => {
	QUnit.module( 'Publish', () => {
		QUnit.test( 'Simple', async ( assert ) => {
			const response = await $e.run( 'document/save/publish' );

			assert.equal( response.data.status, 'publish', 'The response status is: "publish"' );
		} );
	} );
};

export default Publish;
