import ElementsHelper from 'elementor-tests-qunit/core/editor/document/elements/helper';

let tempPostStatus;

export const Draft = () => {
	QUnit.module( 'Draft', ( hooks ) => {
		hooks.before( () => {
			// Save the 'post_status' before the test, to put it back later.
			tempPostStatus = elementor.documents.getCurrent().config.settings.settings.post_status;
		} );

		hooks.after( () => {
			// Put back as it was before.
			elementor.documents.getCurrent().container.settings.set( 'post_status', tempPostStatus );
		} );

		QUnit.test( 'Document post_status is "publish", "private" ', async ( assert ) => {
			const testStatuses = [ 'publish', 'private' ],
				document = elementor.documents.getCurrent();

			for ( const status of testStatuses ) {
				ElementsHelper.settings( document.container, {
					post_status: status,
				} );

				const result = await $e.run( 'document/save/draft' );

				assert.equal( result.data.status, 'inherit' );

				$e.internal( 'document/save/set-is-modified', { status: false } );
			}
		} );

		QUnit.test( 'Document post_status is "draft"', async ( assert ) => {
			const document = elementor.documents.getCurrent();

			ElementsHelper.settings( document.container, {
				post_status: 'draft',
			} );

			const result = await $e.run( 'document/save/draft' );

			// Ensure the document is published.
			assert.equal( result.data.status, 'draft' );
		} );

		QUnit.test( 'rejected: "Document is not editable"', ( assert ) => {
			// Create fake document.
			const document = elementor.documents.getCurrent(),
				defaultStatus = document.editor.status;

			// Editor is not edit able!
			document.editor.status = 'closed';

			// Put something that is not 'draft' to reach reject.
			ElementsHelper.settings( document.container, {
				post_status: 'private',
			} );

			// TODO: Cannot use `assert.rejects` since its return JQuery promise.
			assert.expect( 1 );

			const deferred = $e.run( 'document/save/draft', { document } );

			// Ensure rejected.
			deferred.fail( ( message ) => {
				assert.equal( message, 'Document is not editable' );
			} );

			// Put back as it was before.
			deferred.always( () => {
				document.editor.status = defaultStatus;
			} );
		} );
	} );
};

export default Draft;
