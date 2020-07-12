export const Capture = () => {
	QUnit.module( 'Capture', () => {
		QUnit.test( 'capture as screenshot.', async ( assert ) => {
			assert.expect( 2 );

			$e.internal( 'screenshots/capture' ).then( () => {
				assert.ok(
					! jQuery( 'body' ).find( `iframe[src="${ elementor.config.document.urls.screenshot }"]` ).get( 0 ),
					'IFrame should NOT be exists in the body.'
				);
			} );

			assert.ok( jQuery( 'body' ).find(
				`iframe[src="${ elementor.config.document.urls.screenshot }"]` ).get( 0 ),
				'IFrame should be exists in the body.'
			);

			successfulScreenshot();
		} );

		QUnit.test( 'command will listen to iframe status message, and update the component.', async ( assert ) => {
			assert.expect( 3 );

			const component = $e.components.get( 'screenshots' );

			assert.ok( ! component.isCapturingScreenshot );

			$e.internal( 'screenshots/capture' ).then( () => {
				assert.ok( ! component.isCapturingScreenshot );
			} );

			assert.ok( component.isCapturingScreenshot );

			successfulScreenshot();
		} );
	} );
};

function successfulScreenshot() {
	window.postMessage( {
		name: 'capture-screenshot-done',
		success: true,
	}, '*' );
}

export default Capture;
