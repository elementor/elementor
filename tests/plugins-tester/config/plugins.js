import topPluginsConfig from "./top-plugins.json" assert {type: 'json'};

const notCompatiblePlugins = [
	"flexible-elementor-panel"
];

const pluginsToTest = topPluginsConfig.filter( ( plugin ) => ! notCompatiblePlugins.includes( plugin ) );

export default pluginsToTest;
