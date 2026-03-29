import './types';

type WaitForElementorOptions = {
	maxRetries: number;
	retryInterval?: number;
	checkFn: () => boolean;
};

const ELEMENTOR_LOAD_TIMEOUT_MS = 5000;
const ELEMENTOR_CHECK_INTERVAL_MS = 100;
const DEFAULT_MAX_RETRIES = ELEMENTOR_LOAD_TIMEOUT_MS / ELEMENTOR_CHECK_INTERVAL_MS;

const DEFAULT_WAIT_FOR_ELEMENTOR_OPTIONS: WaitForElementorOptions = {
	maxRetries: DEFAULT_MAX_RETRIES,
	retryInterval: ELEMENTOR_CHECK_INTERVAL_MS,
	checkFn: () => !! ( window.elementor && window.$e ),
};

export function isGutenbergEditor(): boolean {
	return window.wp?.data?.select( 'core/editor' ) !== undefined;
}

export function isElementorEditor(): boolean {
	const params = new URLSearchParams( window.location.search );
	for ( const [ , value ] of params.entries() ) {
		if ( value.includes( 'elementor' ) ) {
			return true;
		}
	}
	return false;
}

export function isElementorAIActive(): boolean {
	return !! window.ElementorAiConfig;
}

export function hasGutenbergUI(): boolean {
	return !! document.querySelector( '.edit-post-header-toolbar' );
}

export function ensureElementorFrontend(): void {
	if ( ! window.elementorFrontend?.elements?.$body ) {
		throw new Error( 'elementorFrontend or its required components not available' );
	}
}

export function isElementorEditorReady(): boolean {
	return !! window.$e?.components.get( 'panel' );
}

export function waitForElementorEditor(): Promise< void > {
	return new Promise( ( resolve ) => {
		if ( isElementorEditorReady() ) {
			resolve();
			return;
		}

		const checkReady = () => {
			if ( isElementorEditorReady() ) {
				resolve();
			} else {
				setTimeout( checkReady, 100 );
			}
		};

		window.addEventListener(
			'DOMContentLoaded',
			() => {
				checkReady();
			},
			{
				once: true,
			}
		);
	} );
}

export function waitForElementor(
	options: WaitForElementorOptions = DEFAULT_WAIT_FOR_ELEMENTOR_OPTIONS
): Promise< void > {
	const { maxRetries, retryInterval, checkFn } = options;

	return new Promise( ( resolve, reject ) => {
		let attempts = 0;

		const check = () => {
			if ( checkFn() ) {
				resolve();
				return;
			}

			attempts++;

			if ( attempts >= maxRetries ) {
				reject( new Error( `Elementor not loaded after ${ maxRetries } attempts` ) );
				return;
			}

			setTimeout( check, retryInterval );
		};

		check();
	} );
}

export async function whenElementorReady< T >(
	fn: () => T | Promise< T >,
	options: WaitForElementorOptions = DEFAULT_WAIT_FOR_ELEMENTOR_OPTIONS
): Promise< T > {
	await waitForElementor( options );
	await waitForElementorEditor();
	return await fn();
}
