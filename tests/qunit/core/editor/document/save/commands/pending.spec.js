export const Pending = () => {
	QUnit.module( 'Pending', ( hooks ) => {
		hooks.before( () => {
			$e.hooks.deactivate();
		} );

		hooks.after( () => {
			$e.hooks.activate();
		} );

		QUnit.test( 'Simple', async ( assert ) => {
			const response = await $e.run( 'document/save/pending' );

			assert.equal( response.data.status, 'pending', 'The response status is: "pending"' );
		} );
	} );
};

export default Pending;
