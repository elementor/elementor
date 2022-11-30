// eslint-disable-next-line
import topPluginsConfig from "./top-plugins.json" assert {type: 'json'};

const notCompatiblePlugins = [
	'embedpress',
	'flexible-elementor-panel',
	'happy-elementor-addons',
	'qi-addons-for-elementor',
	'scroll-magic-addon-for-elementor',
	'sina-extension-for-elementor',
	'the-post-grid',
];

const pluginsToTest = topPluginsConfig.filter( ( plugin ) => ! notCompatiblePlugins.includes( plugin ) );

export default pluginsToTest;
