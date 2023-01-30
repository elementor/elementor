// eslint-disable-next-line
import topPluginsConfig from "./top-plugins.json" assert {type: 'json'};

const notCompatiblePlugins = [
	'essential-addons-for-elementor-lite',
	'embedpress',
	'flexible-elementor-panel',
	'happy-elementor-addons',
	'qi-addons-for-elementor',
	'scroll-magic-addon-for-elementor',
	'sina-extension-for-elementor',
	'the-post-grid',
	'woolentor-addons',
];

const pluginsToTest = topPluginsConfig.filter( ( plugin ) => ! notCompatiblePlugins.includes( plugin ) );

export default pluginsToTest;
