export const EDITOR_REDIRECT_ACKNOWLEDGE_FALLBACK_MS = 3000;

export type PendingEditorRedirect = {
	redirectUrl: string | null;
	fallbackTimerId: ReturnType< typeof setTimeout > | null;
};

export function scheduleEditorRedirectAfterDeploy(
	redirectUrl: string,
	options: {
		fallbackMs?: number;
		navigate?: ( url: string ) => void;
	} = {}
): PendingEditorRedirect {
	const fallbackMs = options.fallbackMs ?? EDITOR_REDIRECT_ACKNOWLEDGE_FALLBACK_MS;
	const navigate =
		options.navigate ??
		( ( url: string ) => {
			window.location.href = url;
		} );

	const pending: PendingEditorRedirect = {
		redirectUrl,
		fallbackTimerId: null,
	};

	pending.fallbackTimerId = setTimeout( () => {
		if ( pending.redirectUrl !== redirectUrl ) {
			return;
		}

		pending.redirectUrl = null;
		pending.fallbackTimerId = null;
		navigate( redirectUrl );
	}, fallbackMs );

	return pending;
}

export function clearPendingEditorRedirect( pending: PendingEditorRedirect | null ): void {
	if ( ! pending ) {
		return;
	}

	if ( pending.fallbackTimerId ) {
		clearTimeout( pending.fallbackTimerId );
		pending.fallbackTimerId = null;
	}

	pending.redirectUrl = null;
}

export function completeEditorRedirectOnDeployAcknowledge(
	pending: PendingEditorRedirect | null,
	navigate: ( url: string ) => void = ( url: string ) => {
		window.location.href = url;
	}
): void {
	const redirectUrl = pending?.redirectUrl;
	clearPendingEditorRedirect( pending );

	if ( redirectUrl ) {
		navigate( redirectUrl );
	}
}
