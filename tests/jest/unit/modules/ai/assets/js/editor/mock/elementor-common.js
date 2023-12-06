export const ajaxResponses = {};
export const elementorCommon = {
	ajax: {
		addRequest: ( endpoint, options ) => {
			switch ( endpoint ) {
				case 'ai_generate_layout': {
					const response = {
						all: [],
						text: 'Test',
						response_id: '12345678',
						usage: 50000,
						base_template_id: '12345',
					};

					ajaxResponses[ endpoint ] = ajaxResponses[ endpoint ] || [];

					ajaxResponses[ endpoint ].push( {
						request: options,
						response,
					} );

					return options.success( response );
				}
				case 'ai_get_remote_config':
					return options.success( {
						config: {
							webBasedBuilderUrl: 'http://localhost:3000',
						},
					} );
				case 'ai_get_user_information':
					return options.success( {
						is_connected: true,
						is_get_started: true,
						usage: {
							builderUrl: 'http://localhost:3000',
							hasAiSubscription: false,
							usedQuota: 440,
							quota: 660,
						},
					} );
			}
		},
	},
};
