export const Pending = () => {
	QUnit.module( 'Pending', () => {
		QUnit.test( 'Simple', async ( assert ) => {
			const response = await $e.run( 'document/save/pending' );

			assert.equal( response.data.status, 'pending', 'The response status is: "pending"' );
		} );
	} );
};

export default Pending;
