const MCP_INTERACTION_EVENT = 'elementor/mcp/interaction';

const FIXED_PROPS = {
	app_type: 'infra',
	window_name: 'elementor_mcp',
	target_location: 'main_content',
};

const HANDLERS = {
	viewed: ( d ) => [ 'mcp_connection_page_viewed', {
		...FIXED_PROPS,
		target_location: 'page',
		interaction_type: 'view',
		target_type: 'page',
		target_name: 'elementor_mcp',
		interaction_result: 'page_loaded',
		client: d.client,
		mode: d.mode,
	} ],
	learn_more_clicked: () => [ 'mcp_learn_more_clicked', {
		...FIXED_PROPS,
		target_location: 'header',
		interaction_type: 'click',
		target_type: 'link',
		target_name: 'what_is_mcp',
		interaction_result: 'link_clicked',
	} ],
	client_selected: ( d ) => [ 'mcp_client_selected', {
		...FIXED_PROPS,
		interaction_type: 'click',
		target_type: 'tab',
		target_name: 'client_tab',
		interaction_result: 'client_switched',
		client: d.client,
		client_previous: d.previous_client,
	} ],
	mode_switched: ( d ) => [ 'mcp_setup_mode_switched', {
		...FIXED_PROPS,
		interaction_type: 'click',
		target_type: 'link',
		target_name: 'setup_mode_toggle',
		interaction_result: 'mode_switched',
		mode: d.mode,
		client: d.client,
	} ],
	credentials_generated: ( d ) => [ 'mcp_credentials_generated', {
		...FIXED_PROPS,
		interaction_type: 'click',
		target_type: 'button',
		target_name: 'generate_credentials',
		interaction_result: 'credentials_generated',
		client: d.client,
		mode: d.mode,
	} ],
	credentials_generation_failed: ( d ) => [ 'mcp_credentials_generation_failed', {
		...FIXED_PROPS,
		interaction_type: 'click',
		target_type: 'button',
		target_name: 'generate_credentials',
		interaction_result: 'generation_failed',
		client: d.client,
		mode: d.mode,
		error_reason: d.error_reason,
	} ],
	config_copied: ( d ) => {
		const props = {
			...FIXED_PROPS,
			interaction_type: 'click',
			target_type: 'button',
			target_name: 'copy_config',
			interaction_result: 'config_copied',
			client: d.client,
			mode: d.mode,
			copy_target: d.copy_target,
		};

		if ( d.os ) {
			props.os = d.os;
		}

		return [ 'mcp_config_copied', props ];
	},
};

window.addEventListener( MCP_INTERACTION_EVENT, ( event ) => {
	const detail = event.detail;

	if ( ! detail || 'string' !== typeof detail.name ) {
		return;
	}

	const build = HANDLERS[ detail.name ];

	if ( ! build ) {
		return;
	}

	const [ eventName, props ] = build( detail );

	window.elementorCommon?.eventsManager?.dispatchEvent( eventName, props );
} );
