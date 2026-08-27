import { resolveFromRoot } from './paths.mjs';

export const PRODUCTION_SUFFIX = '.min';

/**
 * Entries of the `base` bundle: editor, admin, app and module specific scripts.
 *
 * `editor` intentionally lists three sources; they are concatenated into a single bundle in
 * declaration order, which the jQuery plugins it opens with depend on.
 */
export const BASE_ENTRIES = {
	editor: [
		'assets/dev/js/editor/utils/jquery-serialize-object.js',
		'assets/dev/js/editor/utils/jquery-html5-dnd.js',
		'assets/dev/js/editor/editor.js',
	],
	admin: 'assets/dev/js/admin/admin.js',
	'admin-feedback': 'assets/dev/js/admin/admin-feedback.js',
	'announcements-app': 'modules/announcements/assets/js/index.js',
	common: 'core/common/assets/js/common.js',
	'vendors-redux': 'core/common/assets/js/vendors-redux.js',
	'dev-tools': 'modules/dev-tools/assets/js/index.js',
	'elementor-admin-bar': 'modules/admin-bar/assets/js/frontend/module.js',
	gutenberg: 'assets/dev/js/admin/gutenberg.js',
	'new-template': 'assets/dev/js/admin/new-template/new-template.js',
	app: 'app/assets/js/index.js',
	'app-loader': 'app/assets/js/app-loader',
	'app-packages': 'app/assets/js/app-packages',
	'beta-tester': 'assets/dev/js/admin/beta-tester/beta-tester.js',
	'common-modules': 'core/common/assets/js/modules',
	'editor-modules': 'assets/dev/js/editor/modules.js',
	'admin-modules': 'assets/dev/js/admin/modules.js',
	'editor-document': 'assets/dev/js/editor/editor-document.js',
	'admin-top-bar': 'modules/admin-top-bar/assets/js/admin.js',
	checklist: 'modules/checklist/assets/js/editor.js',
	'nested-elements': 'modules/nested-elements/assets/js/editor/index.js',
	'nested-tabs': 'modules/nested-tabs/assets/js/editor/index.js',
	'nested-accordion': 'modules/nested-accordion/assets/js/editor/index.js',
	'container-converter': 'modules/container-converter/assets/js/editor/module.js',
	'atomic-widgets-editor': 'modules/atomic-widgets/assets/js/editor/module.js',
	notes: 'modules/notes/assets/js/notes.js',
	'web-cli': 'modules/web-cli/assets/js/index.js',
	'import-export-admin': 'app/modules/import-export/assets/js/admin.js',
	'import-export-customization-admin': 'app/modules/import-export-customization/assets/js/admin.js',
	'editor-one-admin': 'modules/editor-one/assets/js/admin.js',
	'interactions-shared-utils': 'modules/interactions/assets/js/interactions-shared-utils.js',
	interactions: 'modules/interactions/assets/js/interactions.js',
	'editor-interactions': 'modules/interactions/assets/js/editor-interactions.js',
	'kit-elements-defaults-editor': 'modules/kit-elements-defaults/assets/js/editor/index.js',
	'editor-loader': 'core/editor/loader/js/editor-loader.js',
	'editor-environment': 'core/editor/loader/js/editor-environment.js',
	'responsive-bar': 'assets/dev/js/editor/regions/responsive-bar/index.js',
	ai: 'modules/ai/assets/js/editor/index.js',
	'admin-notifications': 'modules/notifications/assets/js/admin.js',
	'editor-notifications': 'modules/notifications/assets/js/editor.js',
	'ai-layout': 'modules/ai/assets/js/editor/layout-module.js',
	'ai-gutenberg': 'modules/ai/assets/js/gutenberg/index.js',
	'element-manager-admin': 'modules/element-manager/assets/js/admin.js',
	'media-hints': 'assets/dev/js/admin/hints/media.js',
	'ai-media-library': 'modules/ai/assets/js/media-library/index.js',
	'ai-unify-product-images': 'modules/ai/assets/js/woocommerce/index.js',
	'ai-admin': 'modules/ai/assets/js/admin/index.js',
	styleguide: 'modules/styleguide/assets/js/styleguide.js',
	'styleguide-app-initiator': 'modules/styleguide/assets/js/styleguide-app-initiator.js',
	'e-home-screen': 'modules/home/assets/js/app.js',
	'editor-one-sidebar-navigation': 'modules/editor-one/assets/js/sidebar-navigation/app.js',
	'editor-one-top-bar': 'modules/editor-one/assets/js/top-bar/app.js',
	'editor-one-menu': 'modules/editor-one/assets/js/admin-menu/app.js',
	'editor-v4-opt-in': 'modules/atomic-opt-in/assets/js/opt-in-page/app.js',
	'editor-v4-opt-in-alphachip': 'modules/atomic-opt-in/assets/js/panel-chip/panel-chip.js',
	'e-conversion-banner': 'modules/promotions/assets/js/conversion-banner/conversion-banner.js',
	'e-react-promotions': 'modules/promotions/assets/js/react/index.js',
	'e-wc-product-editor': 'modules/wc-product-editor/assets/js/e-wc-product-editor.js',
	'floating-elements-modal': 'assets/dev/js/admin/floating-elements/new-floating-elements.js',
	'cloud-library-screenshot': 'modules/cloud-library/assets/js/preview/screenshot.js',
	'pro-install-events': 'modules/pro-install/assets/js/pro-install-events.js',
	'design-system-sync': 'modules/design-system-sync/assets/js/design-system-sync-handler.js',
	'assets-manager': 'modules/assets-manager/assets/js/assets-manager.js',
};

/**
 * Entries of the `frontend` bundle. Built separately from `base` so that the two groups
 * cannot collide, matching the distinct Webpack `uniqueName` values they used to carry.
 */
export const FRONTEND_ENTRIES = {
	'frontend-modules': 'assets/dev/js/frontend/modules.js',
	frontend: 'assets/dev/js/frontend/frontend.js',
	'youtube-handler': 'modules/atomic-widgets/elements/atomic-youtube/youtube-handler.js',
	'tabs-handler': 'modules/atomic-widgets/elements/atomic-tabs/handlers/atomic-tabs-handler.js',
	'tabs-preview-handler': 'modules/atomic-widgets/elements/atomic-tabs/handlers/atomic-tabs-preview-handler.js',
	'accordion-preview-handler': 'modules/atomic-widgets/elements/atomic-accordion/handlers/editor-accordion-state.js',
	'background-video-handler': 'modules/atomic-widgets/elements/atomic-background-video/handlers/background-video-handler.js',
	'background-video-preview-handler': 'modules/atomic-widgets/elements/atomic-background-video/handlers/background-video-preview-handler.js',
	'atomic-widgets-action-link-handler': 'modules/atomic-widgets/assets/js/frontend/action-link-handlers.js',
	'atomic-widgets-form-handler': 'modules/atomic-widgets/assets/js/frontend/form-handlers.js',
};

export const QUNIT_ENTRIES = {
	'vendors-redux': BASE_ENTRIES[ 'vendors-redux' ],
	'dev-tools': BASE_ENTRIES[ 'dev-tools' ],
	'common-modules': BASE_ENTRIES[ 'common-modules' ],
	'web-cli': BASE_ENTRIES[ 'web-cli' ],
	common: BASE_ENTRIES.common,
	'editor-modules': BASE_ENTRIES[ 'editor-modules' ],
	'editor-document': BASE_ENTRIES[ 'editor-document' ],
	'qunit-tests': 'tests/qunit/main.js',
};

export function toEntrySources( entry ) {
	return ( Array.isArray( entry ) ? entry : [ entry ] ).map( ( source ) => resolveFromRoot( source ) );
}

export function withProductionSuffix( entryName ) {
	return `${ entryName }${ PRODUCTION_SUFFIX }`;
}
