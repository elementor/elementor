import fs from 'fs';

export type Config = {
	core?: string,
	phpVersion?: string,
	plugins?: { [key: string]: string },
	themes?: { [key: string]: string },
	mappings?: { [key: string]: string },
	config?: Record<string, string|boolean>,
}

export const getConfig = ( configFilePath?: string ): Config => {
	let configFile: Config = {};
	if ( configFilePath ) {
		configFile = JSON.parse( fs.readFileSync( configFilePath, 'utf8' ) ) as Config;
	}

	const defaultConfig: Config = {
		core: '6.4',
		phpVersion: '8.0',
		plugins: {},
		themes: {},
		mappings: {},
		config: {},
	};

	return {
		core: configFile.core || defaultConfig.core,
		phpVersion: configFile.phpVersion || defaultConfig.phpVersion,
		plugins: configFile.plugins || defaultConfig.plugins,
		themes: configFile.themes || defaultConfig.themes,
		mappings: configFile.mappings || defaultConfig.mappings,
		config: configFile.config || defaultConfig.config,
	};
};
