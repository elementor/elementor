import { EDITOR_TOUR_READY_TIMEOUT_MS } from './constants';

const isEditorTargetVisible = ( element ) => {
	if ( ! element ) {
		return false;
	}

	const style = window.getComputedStyle( element );

	if ( 'none' === style.display || 'hidden' === style.visibility ) {
		return false;
	}

	const rect = element.getBoundingClientRect();

	return rect.width > 0 && rect.height > 0 && parseFloat( style.opacity ) > 0;
};

const isEditorLoadingOverlayVisible = () => {
	return [ '#elementor-loading', '#elementor-preview-loading' ].some( ( selector ) => {
		return isEditorTargetVisible( document.querySelector( selector ) );
	} );
};

const isEditorPanelReadyForTour = () => {
	const panel = document.querySelector( '#elementor-panel' );

	if ( ! isEditorTargetVisible( panel ) ) {
		return false;
	}

	if ( document.body.classList.contains( 'elementor-panel-loading' ) ) {
		return false;
	}

	if ( isEditorLoadingOverlayVisible() ) {
		return false;
	}

	const elementsWrapper = document.querySelector( '#elementor-panel-elements-wrapper' );

	return !! elementsWrapper?.childElementCount;
};

export const waitForEditorTourReady = ( callback ) => {
	const deadline = Date.now() + EDITOR_TOUR_READY_TIMEOUT_MS;

	const pollUntilReady = () => {
		if ( isEditorPanelReadyForTour() ) {
			callback();
			return;
		}

		if ( Date.now() > deadline ) {
			callback();
			return;
		}

		window.requestAnimationFrame( pollUntilReady );
	};

	const startAfterPreview = () => {
		window.requestAnimationFrame( pollUntilReady );
	};

	if ( window.elementor?.loaded ) {
		startAfterPreview();
		return;
	}

	if ( window.elementor?.once ) {
		window.elementor.once( 'preview:loaded', startAfterPreview );
		return;
	}

	const $window = window.jQuery?.( window );

	if ( $window ) {
		$window.one( 'elementor:loaded', () => {
			if ( window.elementor?.once ) {
				window.elementor.once( 'preview:loaded', startAfterPreview );
			} else {
				startAfterPreview();
			}
		} );
		return;
	}

	startAfterPreview();
};
