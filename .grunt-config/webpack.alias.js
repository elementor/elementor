const path = require( 'path' );

module.exports = {
	resolve: {
		alias: {
			'elementor-editor': path.resolve( __dirname, '../assets/dev/js/editor' ),
			'elementor-behaviors': path.resolve( __dirname, '../assets/dev/js/editor/elements/views/behaviors' ),
			'elementor-regions': path.resolve( __dirname, '../assets/dev/js/editor/regions' ),
			'elementor-controls': path.resolve( __dirname, '../assets/dev/js/editor/controls' ),
			'elementor-elements': path.resolve( __dirname, '../assets/dev/js/editor/elements' ),
			'elementor-views': path.resolve( __dirname, '../assets/dev/js/editor/views' ),
			'elementor-editor-utils': path.resolve( __dirname, '../assets/dev/js/editor/utils' ),
			'elementor-panel': path.resolve( __dirname, '../assets/dev/js/editor/regions/panel' ),
			'elementor-templates': path.resolve( __dirname, '../assets/dev/js/editor/components/template-library' ),
			'elementor-dynamic-tags': path.resolve( __dirname, '../assets/dev/js/editor/components/dynamic-tags' ),
			'elementor-frontend': path.resolve( __dirname, '../assets/dev/js/frontend' ),
			'elementor-revisions': path.resolve( __dirname, '../assets/dev/js/editor/components/revisions' ),
			'elementor-validator': path.resolve( __dirname, '../assets/dev/js/editor/components/validator' ),
			'elementor-utils': path.resolve( __dirname, '../assets/dev/js/utils' ),
			'elementor-admin': path.resolve( __dirname, '../assets/dev/js/admin' ),
			'elementor-modules': path.resolve( __dirname, '../modules' ),
			'elementor-document': path.resolve( __dirname, '../assets/dev/js/editor/document' ),
			'elementor': path.resolve( __dirname, '../' ),
		},
	},
};
