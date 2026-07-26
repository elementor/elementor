import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CURRENT_DIR = dirname( fileURLToPath( import.meta.url ) );
const ROOT = resolve( CURRENT_DIR, '..', '..', '..' );

export const CORE_ALIASES = {
	elementor: ROOT,
	'elementor-app': resolve( ROOT, 'app/assets/js' ),
	'elementor-admin': resolve( ROOT, 'assets/dev/js/admin' ),
	'elementor-api': resolve( ROOT, 'modules/web-cli/assets/js/' ),
	'elementor-assets-js': resolve( ROOT, 'assets/dev/js' ),
	'elementor-behaviors': resolve( ROOT, 'assets/dev/js/editor/elements/views/behaviors' ),
	'elementor-common': resolve( ROOT, 'core/common/assets/js' ),
	'elementor-common-modules': resolve( ROOT, 'core/common/modules' ),
	'elementor-controls': resolve( ROOT, 'assets/dev/js/editor/controls' ),
	'elementor-document': resolve( ROOT, 'assets/dev/js/editor/document' ),
	'elementor-dynamic-tags': resolve( ROOT, 'assets/dev/js/editor/components/dynamic-tags' ),
	'elementor-editor': resolve( ROOT, 'assets/dev/js/editor' ),
	'elementor-editor-utils': resolve( ROOT, 'assets/dev/js/editor/utils' ),
	'elementor-elements': resolve( ROOT, 'assets/dev/js/editor/elements' ),
	'elementor-frontend': resolve( ROOT, 'assets/dev/js/frontend' ),
	'elementor-panel': resolve( ROOT, 'assets/dev/js/editor/regions/panel' ),
	'elementor-regions': resolve( ROOT, 'assets/dev/js/editor/regions' ),
	'elementor-revisions': resolve( ROOT, 'assets/dev/js/editor/components/revisions' ),
	'elementor-scss': resolve( ROOT, 'assets/dev/scss' ),
	'elementor-templates': resolve( ROOT, 'assets/dev/js/editor/components/template-library' ),
	'elementor-utils': resolve( ROOT, 'assets/dev/js/utils' ),
	'elementor-validator': resolve( ROOT, 'assets/dev/js/editor/components/validator' ),
	'elementor-views': resolve( ROOT, 'assets/dev/js/editor/views' ),
	'@elementor/e-icons': resolve( ROOT, 'assets/dev/js/frontend/utils/icons/e-icons' ),
	'e-styles': resolve( ROOT, 'packages/elementor-ui/styles' ),
	'e-components': resolve( ROOT, 'packages/elementor-ui/components' ),
	'e-utils': resolve( ROOT, 'packages/elementor-ui/components/utils' ),
	'elementor-frontend-utils': resolve( ROOT, 'assets/dev/js/frontend/utils' ),
	'elementor-modules': resolve( ROOT, 'modules' ),
};

export function loadAliasesFromConfig() {
	return CORE_ALIASES;
}
