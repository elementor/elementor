import { getCanvasIframeDocument } from '@elementor/editor-v1-adapters';

const CSS_LINK_ID_PREFIX = 'elementor-post-';
const CSS_LINK_ID_SUFFIX = '-css';

export function reloadKitCss() {
	const canvasDocument = getCanvasIframeDocument();

	if ( ! canvasDocument ) {
		return;
	}

	const kitLink = canvasDocument.querySelector< HTMLLinkElement >(
		`link[rel="stylesheet"][id^=${ CSS_LINK_ID_PREFIX }][id$=${ CSS_LINK_ID_SUFFIX }]`
	);

	if ( ! kitLink ) {
		return;
	}

	const url = new URL( kitLink.href );
	url.searchParams.set( 'ver', Date.now().toString() );
	kitLink.href = url.toString();
}
