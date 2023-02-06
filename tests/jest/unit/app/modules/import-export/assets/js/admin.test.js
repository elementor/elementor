describe( 'Admin Test', () => {
	it( 'should check if revert button handler is added', function () {
		window.document.body.innerHTML = `
			<button id="elementor-import-export__revert_kit">
			</button>
		`;
		window.elementorAppConfig = {
			'import-export': {
				lastImportedSession: {
					kit_title: 'Kit Title',
				}
			}
		};

		window.elementorCommon = {
			dialogsManager: {
				createWidget: jest.fn( ( name, options ) => { return {
					show: jest.fn( () => {} )
				} } )
			}
		}

		const Admin = require( 'elementor/app/modules/import-export/assets/js/admin.js' );
		window.dispatchEvent( new Event( 'load' ) );

		document.getElementById( 'elementor-import-export__revert_kit' ).click();

		expect( window.elementorCommon.dialogsManager.createWidget ).toBeCalled();
	} );
} );