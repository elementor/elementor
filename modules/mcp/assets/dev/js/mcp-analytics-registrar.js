( function() {
	const MCP_INTERACTION_EVENT = 'elementor/mcp/interaction';

	const FIXED_PROPS = {
		app_type: 'wpadmin',
		window_name: 'elementor_mcp',
		target_location: 'main_content',
	};

	function buildMixpanelEvent( detail ) {
		switch ( detail.name ) {
			case 'viewed':
				return [ 'mcp_connection_page_viewed', {
					...FIXED_PROPS,
					target_location: 'page',
					interaction_type: 'view',
					target_type: 'page',
					target_name: 'elementor_mcp',
					interaction_result: 'page_loaded',
					client: detail.client,
					mode: detail.mode,
				} ];
			case 'learn_more_clicked':
				return [ 'mcp_learn_more_clicked', {
					...FIXED_PROPS,
					target_location: 'header',
					interaction_type: 'click',
					target_type: 'link',
					target_name: 'what_is_mcp',
					interaction_result: 'link_clicked',
				} ];
			case 'client_selected':
				return [ 'mcp_client_selected', {
					...FIXED_PROPS,
					interaction_type: 'click',
					target_type: 'tab',
					target_name: 'client_tab',
					interaction_result: 'client_switched',
					client: detail.client,
					previous_client: detail.previous_client,
				} ];
			case 'mode_switched':
				return [ 'mcp_setup_mode_switched', {
					...FIXED_PROPS,
					interaction_type: 'click',
					target_type: 'link',
					target_name: 'setup_mode_toggle',
					interaction_result: 'mode_switched',
					mode: detail.mode,
					client: detail.client,
				} ];
			case 'credentials_generated':
				return [ 'mcp_credentials_generated', {
					...FIXED_PROPS,
					interaction_type: 'click',
					target_type: 'button',
					target_name: 'generate_credentials',
					interaction_result: 'credentials_generated',
					client: detail.client,
					mode: detail.mode,
				} ];
			case 'credentials_generation_failed':
				return [ 'mcp_credentials_generation_failed', {
					...FIXED_PROPS,
					interaction_type: 'click',
					target_type: 'button',
					target_name: 'generate_credentials',
					interaction_result: 'generation_failed',
					client: detail.client,
					mode: detail.mode,
					error_reason: detail.error_reason,
				} ];
			case 'config_copied': {
				const props = {
					...FIXED_PROPS,
					interaction_type: 'click',
					target_type: 'button',
					target_name: 'copy_config',
					interaction_result: 'config_copied',
					client: detail.client,
					mode: detail.mode,
					copy_target: detail.copy_target,
				};

				if ( detail.os ) {
					props.os = detail.os;
				}

				return [ 'mcp_config_copied', props ];
			}
			default:
				return null;
		}
	}

	window.addEventListener( MCP_INTERACTION_EVENT, function( event ) {
		const detail = event.detail;

		if ( ! detail || ! detail.name ) {
			return;
		}

		const built = buildMixpanelEvent( detail );

		if ( ! built ) {
			return;
		}

		const eventName = built[ 0 ];
		const props = built[ 1 ];

		window.elementorCommon?.eventsManager?.dispatchEvent?.( eventName, props );
	} );
} )();
