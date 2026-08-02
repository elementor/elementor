import { register } from '@elementor/frontend-handlers';
import { refreshTree } from '@elementor/alpinejs';
import { setEditorState } from './editor-background-video-state';
import { CONTROLS_ELEMENT_TYPE, PAUSE_ELEMENT_TYPE, PLAY_ELEMENT_TYPE } from './background-video-handler';

register( {
	elementType: 'e-background-video',
	id: 'e-background-video-preview-handler',
	callback: ( { element, settings, listenToChildren } ) => {
		const elementId = element.dataset.id;

		setEditorState( elementId, settings.state || 'playing' );
		refreshTree( element );

		listenToChildren( [ PLAY_ELEMENT_TYPE, PAUSE_ELEMENT_TYPE, CONTROLS_ELEMENT_TYPE ] )
			.render( ( event ) => {
				const childElement = event.detail.element;
				const nearestBackgroundVideo = childElement.closest( '[data-e-type="e-background-video"]' );

				if ( nearestBackgroundVideo !== element ) {
					return;
				}

				refreshTree( element );
			} );
	},
} );
