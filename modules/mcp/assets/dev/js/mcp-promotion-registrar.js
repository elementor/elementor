import McpUpgradePromotion from './mcp-upgrade-promotion';

const INJECTION_ID = 'elementor-core-mcp-upgrade';
const RETRY_MS = 50;
const RETRY_TIMEOUT_MS = 5000;

function tryRegisterPromotion() {
	const injectIntoMcpAdminPromotion = window.elementorMcpComposer?.injectIntoMcpAdminPromotion;

	if ( ! injectIntoMcpAdminPromotion ) {
		return false;
	}

	injectIntoMcpAdminPromotion( {
		id: INJECTION_ID,
		component: McpUpgradePromotion,
	} );

	return true;
}

if ( ! tryRegisterPromotion() ) {
	const startedAt = Date.now();

	const intervalId = window.setInterval( () => {
		if ( tryRegisterPromotion() || Date.now() - startedAt >= RETRY_TIMEOUT_MS ) {
			window.clearInterval( intervalId );
		}
	}, RETRY_MS );
}
