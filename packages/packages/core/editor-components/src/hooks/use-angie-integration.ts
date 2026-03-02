import { useCallback, useMemo } from 'react';

const GENERATE_COMPONENT_PROMPT = 'Help me create a custom component';
const DEFAULT_INSTALL_URL = '/wp-admin/plugin-install.php?s=angie&tab=search&type=term';

type AngieConfig = {
	isInstalled: boolean;
	isActive: boolean;
	installUrl: string;
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
			installUrl: DEFAULT_INSTALL_URL,
		}
	);
};

const checkAngieAvailable = (): boolean => {
	try {
		const iframe = document.querySelector( 'iframe[id^="angie"]' );
		return !! iframe;
	} catch {
		return false;
	}
};

export const useAngieIntegration = () => {
	const config = useMemo( () => getAngieConfig(), [] );

	const triggerAngiePrompt = useCallback( ( prompt: string = GENERATE_COMPONENT_PROMPT ) => {
		window.location.hash = `angie-prompt=${ encodeURIComponent( prompt ) }`;
	}, [] );

	const redirectToInstall = useCallback( ( returnPrompt: string = GENERATE_COMPONENT_PROMPT ) => {
		const angieSdk = ( window as Window & { angieSdk?: { setReferrerRedirect?: ( url: string, prompt: string ) => void } } ).angieSdk;
		if ( angieSdk?.setReferrerRedirect ) {
			angieSdk.setReferrerRedirect( window.location.href, returnPrompt );
		}

		window.location.href = config.installUrl;
	}, [ config.installUrl ] );

	const isAngieAvailable = checkAngieAvailable();

	return {
		isAngieAvailable,
		isAngieInstalled: config.isInstalled,
		isAngieActive: config.isActive,
		triggerAngiePrompt,
		redirectToInstall,
	};
};
