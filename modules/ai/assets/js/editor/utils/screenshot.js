import { toCanvas } from 'html-to-image';
import { toggleHistory } from './history';
import { generateIds } from '../context/requests-ids';

export const takeScreenshot = async ( template ) => {
	if ( ! template ) {
		return '';
	}

	// Disable history so the Editor won't show our hidden container as a user action.
	toggleHistory( false );

	const hiddenWrapper = createHiddenWrapper();
	const container = createContainer( template );

	wrapContainer( container, hiddenWrapper );

	elementor.getPreviewView().$childViewContainer[ 0 ].appendChild( hiddenWrapper );

	// Wait for the container to render.
	await waitForContainer( container.id );

	if ( template.elements.length ) {
		await Promise.all( template.elements.map( ( child ) => waitForContainer( child.id ) ) );
	}

	let screenshot;

	try {
		screenshot = await screenshotNode( container.view.$el[ 0 ] );
	} catch ( error ) {
		// Return an empty image url if the screenshot failed.
		screenshot = '';
	}

	deleteContainer( container );

	hiddenWrapper.remove();

	toggleHistory( true );

	return screenshot;
};

function screenshotNode( node ) {
	return toWebp( node, {
		quality: 0.01,
		// Transparent 1x1 pixel.
		imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
	} );
}

async function toWebp( node, options = {} ) {
	const canvas = await toCanvas( node, options );

	return canvas.toDataURL( 'image/webp', options.quality ?? 1 );
}

function createHiddenWrapper() {
	const wrapper = document.createElement( 'div' );

	wrapper.style.position = 'fixed';
	wrapper.style.opacity = '0';
	wrapper.style.inset = '0';

	return wrapper;
}

function createContainer( template ) {
	const model = generateIds( template );

	// Set a custom ID, so it can be used later on in the backend.
	model.id = `e-ai-screenshot-container-${ model.id }`;

	return $e.run( 'document/elements/create', {
		container: elementor.getPreviewContainer(),
		model,
		options: {
			edit: false,
		},
	} );
}

function deleteContainer( container ) {
	return $e.run( 'document/elements/delete', {
		container,
	} );
}

function waitForContainer( id, timeout = 5000 ) {
	const timeoutPromise = sleep( timeout );

	const waitPromise = new Promise( ( resolve ) => {
		elementorFrontend.hooks.addAction( 'frontend/element_ready/global', async ( $element ) => {
			if ( $element.data( 'id' ) === id ) {
				const images = [ ...$element[ 0 ].querySelectorAll( 'img' ) ];

				// Wait for all images to load.
				await Promise.all( images.map( waitForImage ) );

				resolve();
			}
		} );
	} );

	return Promise.any( [
		timeoutPromise,
		waitPromise,
	] );
}

function waitForImage( image ) {
	if ( image.complete ) {
		return Promise.resolve();
	}

	return new Promise( ( resolve ) => {
		image.addEventListener( 'load', resolve );

		image.addEventListener( 'error', () => {
			// Remove the image to make sure it won't break the screenshot.
			image.remove();

			resolve();
		} );
	} );
}

function sleep( ms ) {
	return new Promise( ( resolve ) => setTimeout( resolve, ms ) );
}

function wrapContainer( container, wrapper ) {
	const el = container.view.$el[ 0 ];

	el.parentNode.insertBefore( wrapper, el );
	wrapper.appendChild( el );
}
