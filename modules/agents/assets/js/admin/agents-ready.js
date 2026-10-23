import ReactUtils from 'elementor-utils/react';

import { App } from './app';
import { ScannerApp } from './scanner/scanner-app';

const MOUNT_ID = 'e-agents-ready';
const SCANNER_MOUNT_ID = 'e-agents-ready-scanner';

const mountAgentAccess = ( rootElement, config, isRTL ) => {
	ReactUtils.render( (
		<App
			isRTL={ isRTL }
			isActivated={ !! config.isActivated }
			agentDiscoveryConfig={ config.agentDiscovery }
			botAccessConfig={ config.botAccess }
			browserToolsConfig={ config.browserTools }
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
			isActivated={ !! config.isActivated }
			siteDomain={ scannerConfig.siteDomain || window.location.hostname }
			agentAccessUrl={ scannerConfig.agentAccessUrl || '' }
			seoPluginSearchUrl={ scannerConfig.seoPluginSearchUrl || '' }
			angiePluginSearchUrl={ scannerConfig.angiePluginSearchUrl || '' }
			angieAppUrl={ scannerConfig.angieAppUrl || '' }
			angieInstallHeroUrl={ scannerConfig.angieInstallHeroUrl || '' }
			isAngieActive={ !! scannerConfig.isAngieActive }
			lastReport={ scannerConfig.lastReport || null }
			retryAt={ scannerConfig.retryAt || null }
			llmsConfig={ config.llms }
			markdownConfig={ config.markdown }
			botAccessConfig={ config.botAccess }
			agentDiscoveryConfig={ config.agentDiscovery }
			browserToolsConfig={ config.browserTools }
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
