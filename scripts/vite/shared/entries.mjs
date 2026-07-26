import { existsSync, readdirSync } from 'node:fs';
import { resolveFromRoot } from './paths.mjs';

export const SIMPLE_BASE_ENTRIES = {
	editor: resolveFromRoot( 'scripts/vite/shared/virtual-entries/editor.js' ),
	admin: resolveFromRoot( 'assets/dev/js/admin/admin.js' ),
	'admin-feedback': resolveFromRoot( 'assets/dev/js/admin/admin-feedback.js' ),
	'announcements-app': resolveFromRoot( 'modules/announcements/assets/js/index.js' ),
	common: resolveFromRoot( 'core/common/assets/js/common.js' ),
	'vendors-redux': resolveFromRoot( 'core/common/assets/js/vendors-redux.js' ),
	'dev-tools': resolveFromRoot( 'modules/dev-tools/assets/js/index.js' ),
	'elementor-admin-bar': resolveFromRoot( 'modules/admin-bar/assets/js/frontend/module.js' ),
	gutenberg: resolveFromRoot( 'assets/dev/js/admin/gutenberg.js' ),
	'new-template': resolveFromRoot( 'assets/dev/js/admin/new-template/new-template.js' ),
	app: resolveFromRoot( 'app/assets/js/index.js' ),
	'app-loader': resolveFromRoot( 'app/assets/js/app-loader' ),
	'app-packages': resolveFromRoot( 'app/assets/js/app-packages' ),
	'beta-tester': resolveFromRoot( 'assets/dev/js/admin/beta-tester/beta-tester.js' ),
	'common-modules': resolveFromRoot( 'core/common/assets/js/modules' ),
	'editor-modules': resolveFromRoot( 'assets/dev/js/editor/modules.js' ),
	'admin-modules': resolveFromRoot( 'assets/dev/js/admin/modules.js' ),
	'editor-document': resolveFromRoot( 'assets/dev/js/editor/editor-document.js' ),
	'admin-top-bar': resolveFromRoot( 'modules/admin-top-bar/assets/js/admin.js' ),
	checklist: resolveFromRoot( 'modules/checklist/assets/js/editor.js' ),
	'nested-elements': resolveFromRoot( 'modules/nested-elements/assets/js/editor/index.js' ),
	'nested-tabs': resolveFromRoot( 'modules/nested-tabs/assets/js/editor/index.js' ),
	'nested-accordion': resolveFromRoot( 'modules/nested-accordion/assets/js/editor/index.js' ),
	'container-converter': resolveFromRoot( 'modules/container-converter/assets/js/editor/module.js' ),
	'atomic-widgets-editor': resolveFromRoot( 'modules/atomic-widgets/assets/js/editor/module.js' ),
	notes: resolveFromRoot( 'modules/notes/assets/js/notes.js' ),
	'web-cli': resolveFromRoot( 'modules/web-cli/assets/js/index.js' ),
	'import-export-admin': resolveFromRoot( 'app/modules/import-export/assets/js/admin.js' ),
	'import-export-customization-admin': resolveFromRoot( 'app/modules/import-export-customization/assets/js/admin.js' ),
	'editor-one-admin': resolveFromRoot( 'modules/editor-one/assets/js/admin.js' ),
	'interactions-shared-utils': resolveFromRoot( 'modules/interactions/assets/js/interactions-shared-utils.js' ),
	interactions: resolveFromRoot( 'modules/interactions/assets/js/interactions.js' ),
	'editor-interactions': resolveFromRoot( 'modules/interactions/assets/js/editor-interactions.js' ),
	'kit-elements-defaults-editor': resolveFromRoot( 'modules/kit-elements-defaults/assets/js/editor/index.js' ),
	'editor-loader': resolveFromRoot( 'core/editor/loader/js/editor-loader.js' ),
	'editor-environment': resolveFromRoot( 'core/editor/loader/js/editor-environment.js' ),
	'responsive-bar': resolveFromRoot( 'assets/dev/js/editor/regions/responsive-bar/index.js' ),
	ai: resolveFromRoot( 'modules/ai/assets/js/editor/index.js' ),
	'admin-notifications': resolveFromRoot( 'modules/notifications/assets/js/admin.js' ),
	'editor-notifications': resolveFromRoot( 'modules/notifications/assets/js/editor.js' ),
	'ai-layout': resolveFromRoot( 'modules/ai/assets/js/editor/layout-module.js' ),
	'ai-gutenberg': resolveFromRoot( 'modules/ai/assets/js/gutenberg/index.js' ),
	'element-manager-admin': resolveFromRoot( 'modules/element-manager/assets/js/admin.js' ),
	'media-hints': resolveFromRoot( 'assets/dev/js/admin/hints/media.js' ),
	'ai-media-library': resolveFromRoot( 'modules/ai/assets/js/media-library/index.js' ),
	'ai-unify-product-images': resolveFromRoot( 'modules/ai/assets/js/woocommerce/index.js' ),
	'ai-admin': resolveFromRoot( 'modules/ai/assets/js/admin/index.js' ),
	styleguide: resolveFromRoot( 'modules/styleguide/assets/js/styleguide.js' ),
	'styleguide-app-initiator': resolveFromRoot( 'modules/styleguide/assets/js/styleguide-app-initiator.js' ),
	'e-home-screen': resolveFromRoot( 'modules/home/assets/js/app.js' ),
	'editor-one-sidebar-navigation': resolveFromRoot( 'modules/editor-one/assets/js/sidebar-navigation/app.js' ),
	'editor-one-top-bar': resolveFromRoot( 'modules/editor-one/assets/js/top-bar/app.js' ),
	'editor-one-menu': resolveFromRoot( 'modules/editor-one/assets/js/admin-menu/app.js' ),
	'editor-v4-opt-in': resolveFromRoot( 'modules/atomic-opt-in/assets/js/opt-in-page/app.js' ),
	'pro-free-trial-popup': resolveFromRoot( 'modules/pro-free-trial-popup/assets/js/pro-free-trial-popup.js' ),
	'editor-v4-opt-in-alphachip': resolveFromRoot( 'modules/atomic-opt-in/assets/js/panel-chip/panel-chip.js' ),
	'e-conversion-banner': resolveFromRoot( 'modules/promotions/assets/js/conversion-banner/conversion-banner.js' ),
	'e-react-promotions': resolveFromRoot( 'modules/promotions/assets/js/react/index.js' ),
	'e-wc-product-editor': resolveFromRoot( 'modules/wc-product-editor/assets/js/e-wc-product-editor.js' ),
	'floating-elements-modal': resolveFromRoot( 'assets/dev/js/admin/floating-elements/new-floating-elements.js' ),
	'cloud-library-screenshot': resolveFromRoot( 'modules/cloud-library/assets/js/preview/screenshot.js' ),
	'pro-install-events': resolveFromRoot( 'modules/pro-install/assets/js/pro-install-events.js' ),
	'design-system-sync': resolveFromRoot( 'modules/design-system-sync/assets/js/design-system-sync-handler.js' ),
	'assets-manager': resolveFromRoot( 'modules/assets-manager/assets/js/assets-manager.js' ),
};

export const CHUNKED_BASE_ENTRIES = {};

export const FRONTEND_ENTRIES = {
	'frontend-modules': resolveFromRoot( 'assets/dev/js/frontend/modules.js' ),
	frontend: resolveFromRoot( 'assets/dev/js/frontend/frontend.js' ),
	'youtube-handler': resolveFromRoot( 'modules/atomic-widgets/elements/atomic-youtube/youtube-handler.js' ),
	'tabs-handler': resolveFromRoot( 'modules/atomic-widgets/elements/atomic-tabs/handlers/atomic-tabs-handler.js' ),
	'tabs-preview-handler': resolveFromRoot( 'modules/atomic-widgets/elements/atomic-tabs/handlers/atomic-tabs-preview-handler.js' ),
	'atomic-widgets-action-link-handler': resolveFromRoot( 'modules/atomic-widgets/assets/js/frontend/action-link-handlers.js' ),
	'atomic-widgets-form-handler': resolveFromRoot( 'modules/atomic-widgets/assets/js/frontend/form-handlers.js' ),
};

const PACKAGE_SOURCE_DIRS = [ 'packages/core', 'packages/libs', 'apps' ];

function getPackageEntryPath( packageDir, entrySource ) {
	const srcTs = `${ packageDir }/src/index.ts`;

	if ( 'src' === entrySource ) {
		return srcTs;
	}

	const distJs = `${ packageDir }/dist/index.js`;

	if ( existsSync( distJs ) ) {
		return distJs;
	}

	console.warn( '[vite:packages] Production build is using TypeScript instead of missing dist:', distJs );

	return srcTs;
}

export function getPackageEntries( entrySource = 'dist' ) {
	const repoPath = resolveFromRoot( 'packages' );

	const packages = PACKAGE_SOURCE_DIRS.flatMap( ( dir ) =>
		readdirSync( resolveFromRoot( 'packages', dir ) ).map( ( name ) => ( {
			name,
			path: getPackageEntryPath( resolveFromRoot( 'packages', dir, name ), entrySource ),
		} ) ).filter( ( { path: entryPath } ) => existsSync( entryPath ) ),
	);

	packages.push( {
		name: 'ui',
		path: resolveFromRoot( 'node_modules/@elementor/ui/index.js' ),
	} );

	packages.push( {
		name: 'icons',
		path: resolveFromRoot( 'node_modules/@elementor/icons/index.js' ),
	} );

	return packages;
}

export function withProductionSuffix( entries ) {
	return Object.fromEntries(
		Object.entries( entries ).map( ( [ name, entryPath ] ) => [ `${ name }.min`, entryPath ] ),
	);
}
