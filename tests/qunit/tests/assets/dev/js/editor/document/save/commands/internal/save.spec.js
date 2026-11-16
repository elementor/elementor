export const Save = () => {
	QUnit.module( 'Save', () => {
		QUnit.test( 'Simple', async ( assert ) => {
			const response = await $e.internal( 'document/save/save' );

			assert.equal( response.data.status, 'draft', 'The response status is: "draft"' );
		} );

		QUnit.test( 'Multiple documents', async ( assert ) => {
			const documentConfigs = [
					{ id: 2 },
					{ id: 3 },
				],
				documents = [];

			// Add fake documents.
			documentConfigs.forEach( ( config ) => {
				documents.push( elementor.documents.addDocumentByConfig( config ) );
			} );

			for ( const document of documents ) {
				document.container = elementor.getPreviewContainer();

				const response = await $e.internal( 'document/save/save', { document } );

				assert.equal( response.data.status, 'draft', 'The response status is: "draft"' );
			}
		} );

		QUnit.module( 'external change sync', ( hooks ) => {
			const HTTP_CONFLICT = 409;
			const LAST_SYNCED_AT = 1000;

			let originalAddRequest, originalHeartbeat, originalShowToast, capturedOptions, detectedCount, toastCount;

			hooks.beforeEach( () => {
				originalAddRequest = elementorCommon.ajax.addRequest;
				originalHeartbeat = elementor.heartbeat;
				originalShowToast = elementor.notifications.showToast;
				capturedOptions = null;
				detectedCount = 0;
				toastCount = 0;

				elementorCommon.ajax.addRequest = ( action, options ) => {
					capturedOptions = options;

					return jQuery.Deferred();
				};

				elementor.heartbeat = {
					getSaveSyncData: () => ( { last_synced_at: LAST_SYNCED_AT, ignore_external_changes: false } ),
					onExternalChangeDetected: () => detectedCount++,
				};

				elementor.notifications.showToast = () => toastCount++;
			} );

			hooks.afterEach( () => {
				elementorCommon.ajax.addRequest = originalAddRequest;
				elementor.heartbeat = originalHeartbeat;
				elementor.notifications.showToast = originalShowToast;
				elementor.documents.getCurrent().editor.isSaving = false;
			} );

			QUnit.test( 'sends the heartbeat sync data with save_builder', async ( assert ) => {
				// Act.
				$e.internal( 'document/save/save' );
				await new Promise( ( resolve ) => setTimeout( resolve ) );

				// Assert.
				assert.equal( capturedOptions.data.last_synced_at, LAST_SYNCED_AT );
				assert.strictEqual( capturedOptions.data.ignore_external_changes, false );
			} );

			QUnit.test( 'routes a 409 rejection to onExternalChangeDetected() without a toast', async ( assert ) => {
				// Arrange.
				$e.internal( 'document/save/save' );
				await new Promise( ( resolve ) => setTimeout( resolve ) );

				// Act.
				capturedOptions.error( 'This page was changed by AI after you opened it.', HTTP_CONFLICT );

				// Assert.
				assert.equal( detectedCount, 1 );
				assert.equal( toastCount, 0 );
			} );
		} );
	} );
};

export default Save;
