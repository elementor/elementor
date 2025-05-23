describe( 'Import Export Admin Test', () => {
	beforeEach( () => {
		window.elementorImportExport = {
			lastImportedSession: {
				kit_title: 'Kit Title',
			},
			appUrl: 'https://example.com/kit-library',
		};
	} );

	afterEach( () => {
		// Cleanup
		delete window.elementorAppConfig;
		window.document.body.innerHTML = '';
	} );

	require( 'elementor/app/modules/import-export/assets/js/admin.js' );

	it( 'should check if "kit deleted" dialog is not shown without confirming a delete when on the admin page', () => {
		// Arrange
		window.elementorCommon = {
			dialogsManager: {
				createWidget: jest.fn( () => {
					return {
						show: jest.fn( () => {} ),
					};
				} ),
			},
		};

		// Act
		window.dispatchEvent( new Event( 'load' ) );

		// No Kit referrer dialog shown without refferer in cache
		expect( window.elementorCommon.dialogsManager.createWidget ).not.toHaveBeenCalled();
	} );

	it( 'should check if the referred "kit deleted" dialog is shown when referred from Kit library', () => {
		// Arrange
		window.elementorCommon = {
			dialogsManager: {
				createWidget: jest.fn( ( type, options ) => {
					// Auto confirm
					sessionStorage.setItem( 'elementor-kit-data', JSON.stringify( {
						referrerKitId: '123',
						activeKitName: 'Active Kit Name',
					} ) );

					// To expect
					window.elementorCommon.lastWidgetHeaderMessage = options.headerMessage;
					window.elementorCommon.lastWidgetMessage = options.message;
					return {
						show: jest.fn( () => {} ),
					};
				} ),
			},
		};
		window.document.body.innerHTML = `
			<button id="elementor-import-export__revert_kit">
			</button>
		`;

		// Act
		window.dispatchEvent( new Event( 'load' ) );

		// Set Cache
		document.getElementById( 'elementor-import-export__revert_kit' ).click();

		// Confirmation Widget
		expect( window.elementorCommon.dialogsManager.createWidget ).toHaveBeenCalledTimes( 1 );
		expect( window.elementorCommon.lastWidgetHeaderMessage ).toEqual( 'Are you sure?' );
		expect( window.elementorCommon.lastWidgetMessage ).toEqual( 'Removing Kit Title will permanently delete changes made to the Kit\'s content and site settings' );

		// Simulate reload
		window.dispatchEvent( new Event( 'load' ) );

		// Kit deleted dialog
		expect( window.elementorCommon.dialogsManager.createWidget ).toHaveBeenCalledTimes( 2 );
		expect( window.elementorCommon.lastWidgetHeaderMessage ).toEqual( 'Active Kit Name was successfully deleted' );
		expect( window.elementorCommon.lastWidgetMessage ).toEqual( 'You\'re ready to apply a new Kit!' );
	} );

	it( 'should check if the non-referred "kit deleted" dialog is shown when not referred from Kit library', () => {
		// Arrange
		window.elementorCommon = {
			dialogsManager: {
				createWidget: jest.fn( ( type, options ) => {
					// Auto confirm
					sessionStorage.setItem( 'elementor-kit-data', JSON.stringify( {
						referrerKitId: '', // Non referred
						activeKitName: 'Active Kit Name',
					} ) );

					// To expect
					window.elementorCommon.lastWidgetHeaderMessage = options.headerMessage;
					window.elementorCommon.lastWidgetMessage = options.message;

					return {
						show: jest.fn( () => {} ),
					};
				} ),
			},
		};
		window.document.body.innerHTML = `
			<button id="elementor-import-export__revert_kit">
			</button>
		`;

		// Act
		window.dispatchEvent( new Event( 'load' ) );

		// Set Cache
		document.getElementById( 'elementor-import-export__revert_kit' ).click();

		// Confirmation Widget
		expect( window.elementorCommon.dialogsManager.createWidget ).toHaveBeenCalledTimes( 1 );
		expect( window.elementorCommon.lastWidgetHeaderMessage ).toEqual( 'Are you sure?' );
		expect( window.elementorCommon.lastWidgetMessage ).toEqual( 'Removing Kit Title will permanently delete changes made to the Kit\'s content and site settings' );

		// Simulate reload
		window.dispatchEvent( new Event( 'load' ) );

		// Kit deleted dialog
		expect( window.elementorCommon.dialogsManager.createWidget ).toHaveBeenCalledTimes( 2 );
		expect( window.elementorCommon.lastWidgetHeaderMessage ).toEqual( 'Active Kit Name was successfully deleted' );
		expect( window.elementorCommon.lastWidgetMessage ).toEqual( 'Try a different Kit or build your site from scratch.' );
	} );
} );
