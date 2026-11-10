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

const INITIAL_SERVER_TIME = 1000;

QUnit.module( 'File: assets/dev/js/editor/utils/heartbeat.js', ( hooks ) => {
	let heartbeat, mockDocument, mockEnqueue, mockConnectNow, originalChannelsEditor, originalWp;

	hooks.beforeEach( () => {
		mockEnqueue = makeSpy();
		mockConnectNow = makeSpy();

		originalWp = window.wp;
		window.wp = {
			heartbeat: {
				enqueue: mockEnqueue,
				connectNow: mockConnectNow,
			},
		};

		mockDocument = {
			id: 123,
			config: { server_time: INITIAL_SERVER_TIME },
			editor: { isChanged: false, isSaved: true },
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
		window.wp = originalWp;
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

	QUnit.module( 'sync baseline', () => {
		QUnit.test( 'starts from the document config server time and ignores later ticks', ( assert ) => {
			// Arrange.
			const laterServerTime = INITIAL_SERVER_TIME + 10;

			// Act.
			heartbeat.onTick( null, { elementor_server_time: laterServerTime } );

			// Assert.
			assert.equal( heartbeat.lastSyncedAt, INITIAL_SERVER_TIME );
			assert.notOk( heartbeat.pendingSyncTime );
		} );

		QUnit.test( 'falls back to the first tick when the config has no server time', ( assert ) => {
			// Arrange.
			const tickServerTime = INITIAL_SERVER_TIME + 10;
			mockDocument.config = {};
			const fallbackHeartbeat = new Heartbeat( mockDocument );

			// Act.
			fallbackHeartbeat.onTick( null, { elementor_server_time: tickServerTime } );

			// Assert.
			assert.equal( fallbackHeartbeat.lastSyncedAt, tickServerTime );

			fallbackHeartbeat.destroy();
		} );
	} );

	QUnit.module( 'onSend()', () => {
		QUnit.test( 'always sends current unsaved state for stale-transient cleanup', ( assert ) => {
			const unsavedData = {};
			mockDocument.editor.isSaved = false;
			heartbeat.onSend( null, unsavedData );
			assert.equal( unsavedData.elementor_has_unsaved, 123, 'sends document id when changes are not saved anywhere' );

			const savedData = {};
			mockDocument.editor.isSaved = true;
			heartbeat.onSend( null, savedData );
			assert.strictEqual( savedData.elementor_has_unsaved, null, 'sends null when saved to clear server transient' );
		} );

		QUnit.test( 'sends null after an autosave even though the document is still changed', ( assert ) => {
			// Arrange.
			const data = {};
			mockDocument.editor.isChanged = true;
			mockDocument.editor.isSaved = true;

			// Act.
			heartbeat.onSend( null, data );

			// Assert.
			assert.strictEqual( data.elementor_has_unsaved, null );
		} );
	} );

	QUnit.module( 'onDocumentSaved()', () => {
		QUnit.test( 'calls connectNow so the cleared unsaved flag reaches the server', ( assert ) => {
			// Arrange.
			mockDocument.editor.isSaved = true;

			// Act.
			heartbeat.onDocumentSaved();

			// Assert.
			assert.equal( mockConnectNow.callCount, 1 );
		} );

		QUnit.test( 'does not call connectNow when the document changed during the save', ( assert ) => {
			// Arrange.
			mockDocument.editor.isSaved = false;

			// Act.
			heartbeat.onDocumentSaved();

			// Assert.
			assert.equal( mockConnectNow.callCount, 0 );
		} );
	} );

	QUnit.module( 'MCP mutation marker', ( markerHooks ) => {
		let mockStopAutoSave, mockShowModal, originalComponentsGet;

		markerHooks.beforeEach( () => {
			mockStopAutoSave = makeSpy();
			mockShowModal = makeSpy();
			originalComponentsGet = $e.components.get;
			$e.components.get = () => ( { stopAutoSave: mockStopAutoSave } );
			heartbeat.showExternalChangeModal = mockShowModal;
		} );

		markerHooks.afterEach( () => {
			$e.components.get = originalComponentsGet;
		} );

		QUnit.test( 'stops the autosave timer and shows the modal for a new marker', ( assert ) => {
			// Arrange.
			const mutatedAt = INITIAL_SERVER_TIME + 5;

			// Act.
			heartbeat.onTick( null, { elementor_mcp_mutation: { post_id: 123, mutated_at: mutatedAt } } );

			// Assert.
			assert.equal( mockStopAutoSave.callCount, 1 );
			assert.strictEqual( mockStopAutoSave.calls[ 0 ][ 0 ], mockDocument );
			assert.equal( mockShowModal.callCount, 1 );
			assert.equal( heartbeat.lastSyncedAt, mutatedAt );
		} );

		QUnit.test( 'announces the same marker only once', ( assert ) => {
			// Arrange.
			const response = { elementor_mcp_mutation: { post_id: 123, mutated_at: INITIAL_SERVER_TIME + 5 } };

			// Act.
			heartbeat.onTick( null, response );
			heartbeat.onTick( null, response );

			// Assert.
			assert.equal( mockShowModal.callCount, 1 );
		} );

		QUnit.test( 'announces a newer marker again', ( assert ) => {
			// Act.
			heartbeat.onTick( null, { elementor_mcp_mutation: { post_id: 123, mutated_at: INITIAL_SERVER_TIME + 5 } } );
			heartbeat.onTick( null, { elementor_mcp_mutation: { post_id: 123, mutated_at: INITIAL_SERVER_TIME + 10 } } );

			// Assert.
			assert.equal( mockShowModal.callCount, 2 );
		} );

		QUnit.test( 'ignores markers older than the last sync', ( assert ) => {
			// Act.
			heartbeat.onTick( null, { elementor_mcp_mutation: { post_id: 123, mutated_at: INITIAL_SERVER_TIME - 1 } } );

			// Assert.
			assert.equal( mockStopAutoSave.callCount, 0 );
			assert.equal( mockShowModal.callCount, 0 );
		} );
	} );

	QUnit.module( 'showExternalChangeModal()', () => {
		QUnit.test( 'can be shown again after the previous modal is hidden', ( assert ) => {
			// Arrange.
			const createdConfigs = [];
			const originalCreateWidget = elementorCommon.dialogsManager.createWidget;
			elementorCommon.dialogsManager.createWidget = ( type, config ) => {
				createdConfigs.push( config );
				return { show: () => {} };
			};

			// Act.
			heartbeat.showExternalChangeModal();
			createdConfigs[ 0 ].onHide();
			heartbeat.showExternalChangeModal();

			// Assert.
			assert.equal( createdConfigs.length, 2 );

			elementorCommon.dialogsManager.createWidget = originalCreateWidget;
		} );
	} );
} );
