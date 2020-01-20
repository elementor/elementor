export const Publish = () => {
	QUnit.module( 'Publish', ( hooks ) => {
		hooks.before( () => {
			$e.hooks.deactivate();
		} );

		hooks.after( () => {
			$e.hooks.activate();
		} );

		QUnit.test( 'Simple', async ( assert ) => {
			const response = await $e.run( 'document/save/publish' );

			assert.equal( response.data.status, 'publish', 'The response status is: "publish"' );
		} );
	} );
};

export default Publish;
