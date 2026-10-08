import ReactUtils from 'elementor-utils/react';

import { App } from './app';

const MOUNT_ID = 'e-agents-ready';

const init = () => {
	const rootElement = document.querySelector( `#${ MOUNT_ID }` );

	if ( ! rootElement ) {
		return;
	}

	const config = window.elementorAgentsReadyConfig || {};

	ReactUtils.render( (
		<App
			isRTL={ !! elementorCommon.config.isRTL }
			isExperimentActive={ !! config.isExperimentActive }
			agentDiscoveryConfig={ config.agentDiscovery }
			botAccessConfig={ config.botAccess }
			llmsConfig={ config.llms }
			markdownConfig={ config.markdown }
		/>
	), rootElement );
};

init();
