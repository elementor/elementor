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

		QUnit.test( 'maps isSaved to elementor_has_unpersisted and records the sent value', ( assert ) => {
			// Arrange.
			const unpersistedData = {};
			const persistedData = {};

			// Act.
			mockDocument.editor.isSaved = false;
			heartbeat.onSend( null, unpersistedData );
			const sentWhileUnpersisted = heartbeat.lastSentUnpersisted;

			mockDocument.editor.isSaved = true;
			heartbeat.onSend( null, persistedData );

			// Assert.
			assert.equal( unpersistedData.elementor_has_unpersisted, 123 );
			assert.equal( sentWhileUnpersisted, 123 );
			assert.strictEqual( persistedData.elementor_has_unpersisted, null );
			assert.strictEqual( heartbeat.lastSentUnpersisted, null );
		} );
	} );

	QUnit.module( 'onDocumentChanged() unpersisted reporting', () => {
		QUnit.test( 'connects when an edit is not saved and the server last saw null', ( assert ) => {
			// Arrange.
			mockDocument.editor.isChanged = true;
			mockDocument.editor.isSaved = false;
			heartbeat.lastStateOfDocumentChange = true;
			heartbeat.lastSentUnpersisted = null;

			// Act.
			heartbeat.onDocumentChanged();

			// Assert.
			assert.equal( mockConnectNow.callCount, 1 );
		} );

		QUnit.test( 'does not connect when the server already saw an unpersisted value', ( assert ) => {
			// Arrange.
			mockDocument.editor.isChanged = true;
			mockDocument.editor.isSaved = false;
			heartbeat.lastStateOfDocumentChange = true;
			heartbeat.lastSentUnpersisted = 123;

			// Act.
			heartbeat.onDocumentChanged();

			// Assert.
			assert.equal( mockConnectNow.callCount, 0 );
		} );
	} );

	QUnit.module( 'onSaved()', () => {
		QUnit.test( 'connects when the server holds an unpersisted flag and the save cleared it', ( assert ) => {
			// Arrange.
			heartbeat.lastSentUnpersisted = 123;
			mockDocument.editor.isSaved = true;

			// Act.
			heartbeat.onSaved( {} );

			// Assert.
			assert.equal( mockConnectNow.callCount, 1 );
		} );

		QUnit.test( 'does not connect when nothing was reported or the save did not clear it', ( assert ) => {
			// Arrange.
			heartbeat.lastSentUnpersisted = null;
			mockDocument.editor.isSaved = true;

			// Act.
			heartbeat.onSaved( {} );
			heartbeat.lastSentUnpersisted = 123;
			mockDocument.editor.isSaved = false;
			heartbeat.onSaved( {} );

			// Assert.
			assert.equal( mockConnectNow.callCount, 0 );
		} );

		QUnit.test( 'advances lastSyncedAt from server_time and never moves it back', ( assert ) => {
			// Arrange.
			const saveServerTime = INITIAL_SERVER_TIME + 20;

			// Act.
			heartbeat.onSaved( { config: { document: { server_time: saveServerTime } } } );
			heartbeat.onSaved( { config: { document: { server_time: INITIAL_SERVER_TIME } } } );

			// Assert.
			assert.equal( heartbeat.lastSyncedAt, saveServerTime );
		} );

		QUnit.test( 'is unbound on destroy()', ( assert ) => {
			// Arrange.
			const handlers = {};
			elementor.channels.editor = {
				on: ( event, handler ) => handlers[ event ] = handler,
				off: ( event, handler ) => {
					if ( handlers[ event ] === handler ) {
						delete handlers[ event ];
					}
				},
				trigger: () => {},
			};
			const boundHeartbeat = new Heartbeat( mockDocument );
			mockConnectNow.callCount = 0;
			boundHeartbeat.lastSentUnpersisted = 123;

			// Act.
			boundHeartbeat.destroy();

			// Assert.
			assert.notOk( handlers.saved, 'saved handler removed' );
			assert.equal( mockConnectNow.callCount, 0 );
		} );
	} );

	QUnit.module( 'external changes', () => {
		QUnit.test( 'onTick with a newer marker routes to onExternalChangeDetected()', ( assert ) => {
			// Arrange.
			const detected = makeSpy();
			heartbeat.onExternalChangeDetected = detected;

			// Act.
			heartbeat.onTick( null, { elementor_mcp_mutation: { mutated_at: INITIAL_SERVER_TIME + 1 } } );
			heartbeat.onTick( null, { elementor_mcp_mutation: { mutated_at: INITIAL_SERVER_TIME } } );

			// Assert.
			assert.equal( detected.callCount, 1 );
		} );

		QUnit.test( 'onExternalChangeDetected() stops autosave and shows the modal', ( assert ) => {
			// Arrange.
			const stopAutoSave = makeSpy();
			const showModal = makeSpy();
			const originalGet = $e.components.get;
			$e.components.get = () => ( { stopAutoSave } );
			heartbeat.showExternalChangeModal = showModal;

			// Act.
			heartbeat.onExternalChangeDetected();

			// Assert.
			assert.equal( stopAutoSave.callCount, 1 );
			assert.strictEqual( stopAutoSave.calls[ 0 ][ 0 ], mockDocument );
			assert.equal( showModal.callCount, 1 );

			$e.components.get = originalGet;
		} );

		QUnit.test( 'forceSave() runs document/save/draft and clears the modal', ( assert ) => {
			// Arrange.
			const run = makeSpy();
			const originalRun = $e.run;
			$e.run = run;
			heartbeat.externalChangeModal = {};

			// Act.
			heartbeat.forceSave();

			// Assert.
			assert.equal( run.calls[ 0 ][ 0 ], 'document/save/draft' );
			assert.deepEqual( run.calls[ 0 ][ 1 ], { document: mockDocument } );
			assert.strictEqual( heartbeat.externalChangeModal, null );

			$e.run = originalRun;
		} );

		QUnit.test( 'getSaveSyncData() sends the override exactly once after forceSave()', ( assert ) => {
			// Arrange.
			const originalRun = $e.run;
			$e.run = () => {};
			heartbeat.forceSave();

			// Act.
			const first = heartbeat.getSaveSyncData();
			const second = heartbeat.getSaveSyncData();

			// Assert.
			assert.deepEqual( first, { last_synced_at: INITIAL_SERVER_TIME, ignore_external_changes: true } );
			assert.deepEqual( second, { last_synced_at: INITIAL_SERVER_TIME, ignore_external_changes: false } );

			$e.run = originalRun;
		} );
	} );
} );
