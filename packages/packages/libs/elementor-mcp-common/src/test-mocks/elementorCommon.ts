export const elementorCommon = {
	config: {
		isRTL: false,
		version: '3.2.0',
		experimentalFeatures: {
			experimentalFeature1: true,
			experimentalFeature2: false,
		},
	},
	helpers: {
		getUniqueId: () => Math.random(),
	},
	ajax: {
		addRequest: async ( endpoint: string, options: { success?: ( data: unknown ) => void } ) => {
			switch ( endpoint ) {
				case 'ai_get_remote_config':
					return options.success?.( {
						config: {
							jwt: 'jwt',
							webBasedBuilderUrl: 'webBasedBuilderUrl',
							features: [ 'feature1', 'feature2' ],
						},
					} );
			}
		},
	},
};
