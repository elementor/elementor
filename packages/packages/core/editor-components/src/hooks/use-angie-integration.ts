import { useMemo } from 'react';
import {
	isAngieAvailable as checkAngieAvailable,
	redirectToInstallation,
	sendPromptToAngie,
} from '@elementor/editor-mcp';

const GENERATE_COMPONENT_PROMPT = 'Help me create a custom component';

type AngieConfig = {
	isInstalled: boolean;
	isActive: boolean;
};

type EditorEnv = {
	'@elementor/editor-components'?: {
		angie?: AngieConfig;
	};
};

declare global {
	interface Window {
		elementorEditorV2Env?: EditorEnv;
	}
}

const getAngieConfig = (): AngieConfig => {
	const env = window.elementorEditorV2Env;

	return (
		env?.[ '@elementor/editor-components' ]?.angie ?? {
			isInstalled: false,
			isActive: false,
		}
	);
};

export const useAngieIntegration = () => {
	const config = useMemo( () => getAngieConfig(), [] );

	const triggerAngiePrompt = ( prompt: string = GENERATE_COMPONENT_PROMPT ) => {
		sendPromptToAngie( prompt );
	};

	const redirectToInstall = ( returnPrompt: string = GENERATE_COMPONENT_PROMPT ) => {
		redirectToInstallation( returnPrompt );
	};

	return {
		isAngieAvailable: checkAngieAvailable(),
		isAngieInstalled: config.isInstalled,
		isAngieActive: config.isActive,
		triggerAngiePrompt,
		redirectToInstall,
	};
};
