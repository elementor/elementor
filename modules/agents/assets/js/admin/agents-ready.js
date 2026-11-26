import ReactUtils from 'elementor-utils/react';

import { App } from './app';
import { restoreSdkSidebar, toggleSdkSidebar } from './scanner/open-angie';
import { ScannerApp } from './scanner/scanner-app';

const MOUNT_ID = 'e-agents-ready';
const SCANNER_MOUNT_ID = 'e-agents-ready-scanner';
const ADMIN_BAR_ANGIE_TOGGLE_SELECTOR = '#wp-admin-bar-elementor-angie-toggle > .ab-item';

const logAngieError = ( error ) => {
	// eslint-disable-next-line no-console
	console.error( 'Toggling Angie failed:', error );
};

const bindAdminBarAngieToggle = () => {
	const toggle = document.querySelector( ADMIN_BAR_ANGIE_TOGGLE_SELECTOR );

	if ( ! toggle ) {
		return;
	}

	toggle.addEventListener( 'click', ( event ) => {
		event.preventDefault();

		toggleSdkSidebar().catch( logAngieError );
	} );

	restoreSdkSidebar().catch( logAngieError );
};

const mountAgentAccess = ( rootElement, config, isRTL ) => {
	ReactUtils.render( (
		<App
			isRTL={ isRTL }
			isActivated={ !! config.isActivated }
			readinessScoreUrl={ config.readinessScoreUrl || '' }
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
			isAngieInstalled={ !! scannerConfig.isAngieInstalled }
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

	bindAdminBarAngieToggle();
};

init();
