let tempPostStatus;

export const Default = () => {
	QUnit.module( 'Default', ( hooks ) => {
		hooks.before( () => {
			// Save the 'post_status' before the test, to put it back later.
			tempPostStatus = elementor.documents.getCurrent().config.settings.settings.post_status;
		} );

		hooks.after( () => {
			// Put back as it was before.
			elementor.documents.getCurrent().container.settings.set( 'post_status', tempPostStatus );
		} );

		QUnit.test( 'Document post_status is "draft"', async ( assert ) => {
			const document = elementor.documents.getCurrent();

			document.container.settings.set( 'post_status', 'draft' );

			const result = await $e.run( 'document/save/default' );

			// Ensure the document is published.
			assert.equal( result.data.status, 'publish' );
		} );

		QUnit.test( 'Document post_status is "draft" and user cannot publish', async ( assert ) => {
			const document = elementor.documents.getCurrent();

			document.container.settings.set( 'post_status', 'draft' );

			// Force it to be pending.
			document.config.user.can_publish = false;

			const result = await $e.run( 'document/save/default' );

			// Ensure the document is pending.
			assert.equal( result.data.status, 'pending' );

			// Restore it.
			document.config.user.can_publish = true;
		} );

		QUnit.test( 'Document post_status is "publish", "future", "private" ', async ( assert ) => {
			// TODO: There is real bug with 'future'.
			const testStatuses = [ 'publish', 'private' /*, 'future' */ ],
				document = elementor.documents.getCurrent();

			for ( const status of testStatuses ) {
				document.container.settings.set( 'post_status', status );

				const result = await $e.run( 'document/save/default' );

				// Ensure the document is published.
				assert.equal( result.data.status, status );
			}
		} );

		QUnit.test( 'Document post_status is "pending"', async ( assert ) => {
			const document = elementor.documents.getCurrent();

			document.container.settings.set( 'post_status', 'pending' );

			const result = await $e.run( 'document/save/default' );

			// Ensure the document is published.
			assert.equal( result.data.status, 'publish' );
		} );

		QUnit.test( 'Document post_status is "pending" and user cannot publish', async ( assert ) => {
			const document = elementor.documents.getCurrent();

			document.container.settings.set( 'post_status', 'pending' );

			// Force it to be pending.
			document.config.user.can_publish = false;

			const result = await $e.run( 'document/save/default' );

			// Ensure the document is pending.
			assert.equal( result.data.status, 'pending' );

			// Restore it.
			document.config.user.can_publish = true;
		} );
	} );
};

export default Default;
