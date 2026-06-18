import HookUIAfter from 'elementor-api/modules/hooks/ui/after';

const SCENARIOS = {
	post: 'single_post',
	page: 'header_footer',
	product: 'single_product',
};

function getWpPostTypeFromConfig() {
	const url = elementor?.config?.document?.urls?.all_post_type;

	if ( ! url || 'string' !== typeof url ) {
		return null;
	}

	try {
		const parsed = new URL( url, window.location.origin );
		return parsed.searchParams.get( 'post_type' ) || 'post';
	} catch {
		const match = url.match( /[?&]post_type=([^&#]+)/ );
		return match?.[ 1 ] ? decodeURIComponent( match[ 1 ] ) : 'post';
	}
}

function resolveScenario() {
	const wpPostType = getWpPostTypeFromConfig();
	return wpPostType ? ( SCENARIOS[ wpPostType ] || null ) : null;
}

function shouldTrigger( { scenario, detections } ) {
	if ( ! scenario || ! detections ) {
		return false;
	}

	const counts = detections.contentCounts || {};
	const templates = detections.templatePresence || {};

	if ( 'single_post' === scenario ) {
		return 2 === counts.post && ! templates.single_post;
	}

	if ( 'single_product' === scenario ) {
		return 2 === counts.product && ! templates.single_product;
	}

	if ( 'header_footer' === scenario ) {
		const hasHeader = Boolean( templates.header );
		const hasFooter = Boolean( templates.footer );
		return 2 === counts.page && ( ! hasHeader || ! hasFooter );
	}

	return false;
}

function getDetectionsFromSaveResult( result ) {
	const candidate =
		result?.data?.config?.document?.themeBuilderPromotionDetections ??
		result?.data?.config?.themeBuilderPromotionDetections ??
		result?.data?.themeBuilderPromotionDetections ??
		elementor?.config?.document?.themeBuilderPromotionDetections ??
		null;

	if ( ! candidate || 'object' !== typeof candidate ) {
		return null;
	}

	if ( ! candidate.contentCounts || ! candidate.templatePresence ) {
		return null;
	}

	return candidate;
}

export class ThemeBuilderPromotionAfterSave extends HookUIAfter {
	getCommand() {
		return 'document/save/save';
	}

	getId() {
		return 'theme-builder-promotion-after-save';
	}

	apply( args, result ) {
		const { status } = args;

		if ( 'publish' !== status ) {
			return;
		}

		const scenario = resolveScenario();
		const detections = getDetectionsFromSaveResult( result );

		if ( ! shouldTrigger( { scenario, detections } ) ) {
			return;
		}

		const postType = getWpPostTypeFromConfig();

		window.dispatchEvent(
			new CustomEvent( 'elementor/theme-builder-promotion/trigger', {
				detail: {
					scenario,
					postType,
					detections,
				},
			} ),
		);
	}
}

export default ThemeBuilderPromotionAfterSave;

