import Heartbeat from 'elementor/assets/dev/js/editor/utils/heartbeat';

const makeSpy = () => {
	const fn = function() {
		fn.calls.push( Array.from( arguments ) );
		fn.callCount++;
	};
	fn.calls = [];
	fn.callCount = 0;
	return fn;
};

QUnit.module( 'File: assets/dev/js/editor/utils/heartbeat.js', ( hooks ) => {
	let heartbeat, mockDocument, mockEnqueue, mockConnectNow, originalChannelsEditor;

	hooks.beforeEach( () => {
		mockEnqueue = makeSpy();
		mockConnectNow = makeSpy();

		window.wp = {
			heartbeat: {
				enqueue: mockEnqueue,
				connectNow: mockConnectNow,
			},
		};

		mockDocument = {
			id: 123,
			editor: { isChanged: false },
		};

		originalChannelsEditor = elementor.channels.editor;
		elementor.channels.editor = { on: () => {}, off: () => {}, trigger: () => {} };

		heartbeat = new Heartbeat( mockDocument );

		mockEnqueue.calls = [];
		mockEnqueue.callCount = 0;
		mockConnectNow.calls = [];
		mockConnectNow.callCount = 0;
	} );

	hooks.afterEach( () => {
		heartbeat.destroy();
		elementor.channels.editor = originalChannelsEditor;
	} );

	QUnit.module( 'onDocumentChanged()', () => {
		QUnit.test( 'false→true: calls connectNow for immediate dirty signal', ( assert ) => {
			mockDocument.editor.isChanged = true;
			heartbeat.lastStateOfDocumentChange = false;

			heartbeat.onDocumentChanged();

			assert.equal( mockConnectNow.callCount, 1, 'connectNow called once' );
			assert.equal( mockEnqueue.callCount, 0, 'enqueue not called (onSend handles it)' );
		} );

		QUnit.test( 'true→false: no forced beat, onSend handles state on next tick', ( assert ) => {
			mockDocument.editor.isChanged = false;
			heartbeat.lastStateOfDocumentChange = true;

			heartbeat.onDocumentChanged();

			assert.equal( mockEnqueue.callCount, 0, 'enqueue not called' );
			assert.equal( mockConnectNow.callCount, 0, 'connectNow not called' );
		} );

		QUnit.test( 'no signal when state is unchanged', ( assert ) => {
			mockDocument.editor.isChanged = true;
			heartbeat.lastStateOfDocumentChange = true;

			heartbeat.onDocumentChanged();

			assert.equal( mockEnqueue.callCount, 0, 'enqueue not called' );
			assert.equal( mockConnectNow.callCount, 0, 'connectNow not called' );
		} );
	} );

	QUnit.module( 'reloadDocument()', () => {
		QUnit.test( 'clears dirty flag and triggers reload', ( assert ) => {
			// Arrange.
			const mockDoReload = makeSpy();
			const mockInternal = makeSpy();
			heartbeat._doReload = mockDoReload;
			const originalInternal = $e.internal;
			$e.internal = mockInternal;

			// Act.
			heartbeat.reloadDocument();

			// Assert.
			assert.equal( mockInternal.callCount, 1, '$e.internal called once' );
			assert.equal( mockInternal.calls[ 0 ][ 0 ], 'document/save/set-is-modified' );
			assert.deepEqual( mockInternal.calls[ 0 ][ 1 ], { status: false } );
			assert.equal( mockDoReload.callCount, 1, 'reload called once' );

			$e.internal = originalInternal;
		} );
	} );

	QUnit.module( 'onSend()', () => {
		QUnit.test( 'always sends current dirty state for stale-transient cleanup', ( assert ) => {
			const dirtyData = {};
			mockDocument.editor.isChanged = true;
			heartbeat.onSend( null, dirtyData );
			assert.equal( dirtyData.elementor_has_unsaved, 123, 'sends document id when dirty' );

			const cleanData = {};
			mockDocument.editor.isChanged = false;
			heartbeat.onSend( null, cleanData );
			assert.strictEqual( cleanData.elementor_has_unsaved, null, 'sends null when clean to clear server transient' );
		} );
	} );
} );
