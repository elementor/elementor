import { register } from '@elementor/frontend-handlers';
import { Alpine } from '@elementor/alpinejs';
import { isEditorPreview } from './editor-background-video-state';

const PLAYING_CLASS = 'e--playing';
const PAUSED_CLASS = 'e--paused';
// Functional state classes on the root element that drive play/pause button visibility via CSS.
// The root re-renders (client-side twig) on every settings change and always carries the correct
// class, so button visibility survives the editor tearing down and re-creating the child DOM nodes.
const ROOT_PLAYING_CLASS = 'e-background-video--playing';
const ROOT_PAUSED_CLASS = 'e-background-video--paused';
const PLAY_ELEMENT_TYPE = 'e-background-video-play';
const PAUSE_ELEMENT_TYPE = 'e-background-video-pause';
const CONTROLS_ELEMENT_TYPE = 'e-background-video-controls';

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

register( {
	elementType: 'e-background-video',
	id: 'e-background-video-handler',
	callback: ( { element, settings, signal } ) => {
		const elementId = element.dataset.id;
		const video = element.querySelector( '.e-background-video__media' );

		applyVideoSettings( video, settings );

		Alpine.data( `eBackgroundVideo${ elementId }`, () => ( {
			isPlaying: video ? ! video.paused : false,
			isEditor: isEditorPreview(),
			editorState: settings.state || 'playing',

			get previewState() {
				if ( this.isEditor ) {
					return this.editorState;
				}

				return this.isPlaying ? 'playing' : 'paused';
			},
			get showPlayButton() {
				return 'paused' === this.previewState;
			},
			get showPauseButton() {
				return 'playing' === this.previewState;
			},
			play() {
				if ( ! video ) {
					return;
				}

				video.play().catch( () => {} );
			},
			pause() {
				if ( ! video ) {
					return;
				}

				video.pause();
			},
			init() {
				if ( video ) {
					video.addEventListener( 'play', () => {
						this.isPlaying = true;
					}, { signal } );
					video.addEventListener( 'pause', () => {
						this.isPlaying = false;
					}, { signal } );
				}
			},
			rootState: {
				':class'() {
					// In the editor the state is design-time and rendered onto the root by twig on
					// every re-render; let that class stand rather than fighting it with a possibly
					// stale Alpine value. On the frontend, drive it from real playback.
					if ( this.isEditor ) {
						return {};
					}

					return {
						[ ROOT_PLAYING_CLASS ]: this.isPlaying,
						[ ROOT_PAUSED_CLASS ]: ! this.isPlaying,
					};
				},
			},
			controlsWrapper: {
				':class'() {
					return {
						[ PLAYING_CLASS ]: 'playing' === this.previewState,
						[ PAUSED_CLASS ]: 'paused' === this.previewState,
					};
				},
			},
			playButton: {
				'@click'() {
					this.play();
				},
			},
			pauseButton: {
				'@click'() {
					this.pause();
				},
			},
		} ) );

		return () => {};
	},
} );

export { PLAY_ELEMENT_TYPE, PAUSE_ELEMENT_TYPE, CONTROLS_ELEMENT_TYPE };
