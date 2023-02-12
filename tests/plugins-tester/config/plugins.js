// eslint-disable-next-line
import topPluginsConfig from "./top-plugins.json" assert {type: 'json'};

const notCompatiblePlugins = [
	'complianz-gdpr', // SQL Error
	'easy-table-of-contents', // A welcome page replaces the editor.
	'elementor-beta', // Enables container experiment and panel badge.
	'embedpress',
	'essential-addons-for-elementor-lite',
	'flexible-elementor-panel',
	'happy-elementor-addons',
	'paid-memberships-pro', // A welcome page replaces the editor.
	'qi-addons-for-elementor',
	'scroll-magic-addon-for-elementor',
	'sina-extension-for-elementor',
	'the-post-grid',
	'woolentor-addons',
];

const pluginsToTest = topPluginsConfig.filter( ( plugin ) => ! notCompatiblePlugins.includes( plugin ) );

export default pluginsToTest;
