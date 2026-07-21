import { register } from '@elementor/frontend-handlers';
import { Alpine } from '@elementor/alpinejs';
import { isEditorPreview } from './editor-background-video-state';

const PLAYING_CLASS = 'e--playing';
const PAUSED_CLASS = 'e--paused';
const PLAY_ELEMENT_TYPE = 'e-background-video-play';
const PAUSE_ELEMENT_TYPE = 'e-background-video-pause';
const CONTROLS_ELEMENT_TYPE = 'e-background-video-controls';
const HIDDEN_CLASS = 'e-background-video__button--hidden';

function getSettingsFromElement( element ) {
	try {
		return JSON.parse( element.dataset.eSettings || '{}' );
	} catch {
		return {};
	}
}

function applyVideoSettings( video, settings ) {
	if ( ! video ) {
		return;
	}

	video.muted = Boolean( settings.mute );
	video.loop = Boolean( settings.loop );
	video.autoplay = Boolean( settings.autoplay );

	if ( settings.start_time ) {
		video.currentTime = Number( settings.start_time );
	}

	if ( settings.autoplay ) {
		video.play().catch( () => {} );
	}
}

function getPreviewState( element, video ) {
	if ( isEditorPreview() ) {
		const settings = getSettingsFromElement( element );

		return settings.state || 'playing';
	}

	return video && ! video.paused ? 'playing' : 'paused';
}

function updateButtonVisibility( element, video ) {
	const previewState = getPreviewState( element, video );
	const playButton = element.querySelector( `[data-e-type="${ PLAY_ELEMENT_TYPE }"]` );
	const pauseButton = element.querySelector( `[data-e-type="${ PAUSE_ELEMENT_TYPE }"]` );
	const controlsWrapper = element.querySelector( `[data-e-type="${ CONTROLS_ELEMENT_TYPE }"]` );

	if ( playButton ) {
		playButton.classList.toggle( HIDDEN_CLASS, 'paused' !== previewState );
		playButton.hidden = 'paused' !== previewState;
	}

	if ( pauseButton ) {
		pauseButton.classList.toggle( HIDDEN_CLASS, 'playing' !== previewState );
		pauseButton.hidden = 'playing' !== previewState;
	}

	if ( controlsWrapper ) {
		controlsWrapper.classList.toggle( PLAYING_CLASS, 'playing' === previewState );
		controlsWrapper.classList.toggle( PAUSED_CLASS, 'paused' === previewState );
	}
}

function bindPlayPauseButtons( element, video, signal ) {
	const playButton = element.querySelector( `[data-e-type="${ PLAY_ELEMENT_TYPE }"]` );
	const pauseButton = element.querySelector( `[data-e-type="${ PAUSE_ELEMENT_TYPE }"]` );

	const onPlayClick = ( event ) => {
		event.preventDefault();
		event.stopPropagation();

		if ( video ) {
			video.play().catch( () => {} );
		}
	};

	const onPauseClick = ( event ) => {
		event.preventDefault();
		event.stopPropagation();

		if ( video ) {
			video.pause();
		}
	};

	playButton?.addEventListener( 'click', onPlayClick, { signal } );
	pauseButton?.addEventListener( 'click', onPauseClick, { signal } );

	if ( video ) {
		const onPlaybackChange = () => updateButtonVisibility( element, video );

		video.addEventListener( 'play', onPlaybackChange, { signal } );
		video.addEventListener( 'pause', onPlaybackChange, { signal } );
	}
}

register( {
	elementType: 'e-background-video',
	id: 'e-background-video-handler',
	callback: ( { element, settings, signal } ) => {
		const elementId = element.dataset.id;
		const video = element.querySelector( '.e-background-video__media' );

		applyVideoSettings( video, settings );
		updateButtonVisibility( element, video );
		bindPlayPauseButtons( element, video, signal );

		Alpine.data( `eBackgroundVideo${ elementId }`, () => ( {
			init() {
				updateButtonVisibility( element, video );
			},
			controlsWrapper: {
				':class'() {
					const previewState = getPreviewState( element, video );

					return {
						[ PLAYING_CLASS ]: 'playing' === previewState,
						[ PAUSED_CLASS ]: 'paused' === previewState,
					};
				},
			},
		} ) );

		return () => {};
	},
} );

export { PLAY_ELEMENT_TYPE, PAUSE_ELEMENT_TYPE, CONTROLS_ELEMENT_TYPE };
