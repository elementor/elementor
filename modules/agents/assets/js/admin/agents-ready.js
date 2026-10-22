import ReactUtils from 'elementor-utils/react';

import { App } from './app';
import { resolveAgentReadyActive } from './scanner/resolve-agent-ready-active';
import { ScannerApp } from './scanner/scanner-app';

const MOUNT_ID = 'e-agents-ready';
const SCANNER_MOUNT_ID = 'e-agents-ready-scanner';

const mountAgentAccess = ( rootElement, config, isRTL ) => {
	ReactUtils.render( (
		<App
			isRTL={ isRTL }
			isExperimentActive={ resolveAgentReadyActive( config.isExperimentActive ) }
			agentDiscoveryConfig={ config.agentDiscovery }
			botAccessConfig={ config.botAccess }
			llmsConfig={ config.llms }
			markdownConfig={ config.markdown }
		/>
	), rootElement );
};

const mountScanner = ( rootElement, config, isRTL ) => {
	const scannerConfig = config.scanner || {};

	ReactUtils.render( (
		<ScannerApp
			isRTL={ isRTL }
			isExperimentActive={ resolveAgentReadyActive( config.isExperimentActive ) }
			siteDomain={ scannerConfig.siteDomain || window.location.hostname }
			agentAccessUrl={ scannerConfig.agentAccessUrl || '' }
			lastReport={ scannerConfig.lastReport || null }
			retryAt={ scannerConfig.retryAt || null }
		/>
	), rootElement );
};

const init = () => {
	const config = window.elementorAgentsReadyConfig || {};
	const isRTL = !! elementorCommon.config.isRTL;
	const scannerRoot = document.querySelector( `#${ SCANNER_MOUNT_ID }` );
	const agentAccessRoot = document.querySelector( `#${ MOUNT_ID }` );

	if ( scannerRoot ) {
		mountScanner( scannerRoot, config, isRTL );
	}

	if ( agentAccessRoot ) {
		mountAgentAccess( agentAccessRoot, config, isRTL );
	}
};

init();
