// eslint-disable-next-line no-unused-vars
const elementorDevToolsConfig = {
	isDebug: true,
	urls: { assets: 'http://elementor.localhost/wp-content/plugins/elementor/assets/' },
	deprecation: {
		// Enabling passing Elementor version from `package.json`.
		current_version: __karma__.config.qunit.elementorVersion,
		soft_notices: {},
	},
};
