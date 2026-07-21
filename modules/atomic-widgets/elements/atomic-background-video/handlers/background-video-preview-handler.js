import { register } from '@elementor/frontend-handlers';
import { refreshTree } from '@elementor/alpinejs';
import { CONTROLS_ELEMENT_TYPE, PAUSE_ELEMENT_TYPE, PLAY_ELEMENT_TYPE } from './background-video-handler';

register( {
	elementType: 'e-background-video',
	id: 'e-background-video-preview-handler',
	callback: ( { element, listenToChildren } ) => {
		const syncPreview = () => {
			refreshTree( element );
		};

		const observer = new MutationObserver( syncPreview );

		observer.observe( element, {
			attributes: true,
			attributeFilter: [ 'data-e-settings' ],
			subtree: true,
		} );

		listenToChildren( [ PLAY_ELEMENT_TYPE, PAUSE_ELEMENT_TYPE, CONTROLS_ELEMENT_TYPE ] )
			.render( ( event ) => {
				const childElement = event.detail.element;
				const nearestBackgroundVideo = childElement.closest( '[data-e-type="e-background-video"]' );

				if ( nearestBackgroundVideo !== element ) {
					return;
				}

				syncPreview();
			} );

		return () => {
			observer.disconnect();
		};
	},
} );
