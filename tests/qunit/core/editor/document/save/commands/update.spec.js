export const Update = () => {
	QUnit.module( 'Update', ( hooks ) => {
		hooks.before( () => {
			$e.hooks.deactivate();
		} );

		hooks.after( () => {
			$e.hooks.activate();
		} );

		QUnit.test( 'Simple', async ( assert ) => {
			const response = await $e.run( 'document/save/update' );

			assert.equal( response.data.status,
				elementor.documents.getCurrent().container.settings.get( 'post_status' )
			);
		} );
	} );
};

export default Update;
