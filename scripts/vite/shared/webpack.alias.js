const path = require( 'path' );

const ROOT = path.resolve( __dirname, '..', '..', '..' );

module.exports = {
	resolve: {
		alias: {
			'elementor': ROOT,
			'elementor-app': path.resolve( ROOT, 'app/assets/js' ),
			'elementor-admin': path.resolve( ROOT, 'assets/dev/js/admin' ),
			'elementor-api': path.resolve( ROOT, 'modules/web-cli/assets/js/' ),
			'elementor-assets-js': path.resolve( ROOT, 'assets/dev/js' ),
			'elementor-behaviors': path.resolve( ROOT, 'assets/dev/js/editor/elements/views/behaviors' ),
			'elementor-common': path.resolve( ROOT, 'core/common/assets/js' ),
			'elementor-common-modules': path.resolve( ROOT, 'core/common/modules' ),
			'elementor-controls': path.resolve( ROOT, 'assets/dev/js/editor/controls' ),
			'elementor-document': path.resolve( ROOT, 'assets/dev/js/editor/document' ),
			'elementor-dynamic-tags': path.resolve( ROOT, 'assets/dev/js/editor/components/dynamic-tags' ),
			'elementor-editor': path.resolve( ROOT, 'assets/dev/js/editor' ),
			'elementor-editor-utils': path.resolve( ROOT, 'assets/dev/js/editor/utils' ),
			'elementor-elements': path.resolve( ROOT, 'assets/dev/js/editor/elements' ),
			'elementor-frontend': path.resolve( ROOT, 'assets/dev/js/frontend' ),
			'elementor-panel': path.resolve( ROOT, 'assets/dev/js/editor/regions/panel' ),
			'elementor-regions': path.resolve( ROOT, 'assets/dev/js/editor/regions' ),
			'elementor-revisions': path.resolve( ROOT, 'assets/dev/js/editor/components/revisions' ),
			'elementor-scss': path.resolve( ROOT, 'assets/dev/scss' ),
			'elementor-templates': path.resolve( ROOT, 'assets/dev/js/editor/components/template-library' ),
			'elementor-utils': path.resolve( ROOT, 'assets/dev/js/utils' ),
			'elementor-validator': path.resolve( ROOT, 'assets/dev/js/editor/components/validator' ),
			'elementor-views': path.resolve( ROOT, 'assets/dev/js/editor/views' ),
			'@elementor/e-icons': path.resolve( ROOT, 'assets/dev/js/frontend/utils/icons/e-icons' ),
			'e-styles': path.resolve( ROOT, 'packages/elementor-ui/styles' ),
			'e-components': path.resolve( ROOT, 'packages/elementor-ui/components' ),
			'e-utils': path.resolve( ROOT, 'packages/elementor-ui/components/utils' ),
			'elementor-frontend-utils': path.resolve( ROOT, 'assets/dev/js/frontend/utils' ),
			'elementor-modules': path.resolve( ROOT, 'modules' ),
		},
	},
};
