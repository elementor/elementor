/* global jQuery */
export const Capture = () => {
	QUnit.module( 'Capture', () => {
		const iFrameSelector = `iframe[src="${ elementor.config.document.urls.screenshot }"]`;

		QUnit.test( 'Add and remove the screenshot iframe on success', async ( assert ) => {
			assert.expect( 2 );

			$e.internal( 'screenshots/capture' ).then( () => {
				assert.ok(
					! jQuery( 'body' ).find( iFrameSelector ).length,
					'IFrame should NOT be exists in the body.'
				);
			} );

			assert.ok(
				jQuery( 'body' ).find( iFrameSelector ).length,
				'IFrame should be exists in the body.'
			);

			screenshotDone();
		} );

		QUnit.test( 'Add and remove the screenshot iframe on failed', async ( assert ) => {
			assert.expect( 2 );

			$e.internal( 'screenshots/capture' ).catch( () => {
				assert.ok(
					! jQuery( 'body' ).find( iFrameSelector ).length,
					'IFrame should NOT be exists in the body.'
				);
			} );

			assert.ok(
				jQuery( 'body' ).find( iFrameSelector ).length,
				'IFrame should be exists in the body.'
			);

			screenshotDone( false );
		} );

		QUnit.test( 'command will listen to iframe status message, and update the component.', async ( assert ) => {
			assert.expect( 3 );

			const component = $e.components.get( 'screenshots' );

			assert.ok( ! component.isCapturingScreenshot );

			$e.internal( 'screenshots/capture' ).then( () => {
				assert.ok( ! component.isCapturingScreenshot );
			} );

			assert.ok( component.isCapturingScreenshot );

			screenshotDone();
		} );
	} );
};

function screenshotDone( success = true ) {
	window.postMessage( {
		name: 'capture-screenshot-done',
		success,
	}, '*' );
}

export default Capture;
