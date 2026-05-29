import { mapPlannerStepToPage } from './planner-steps';

export type BuildIframeUrlSession = {
	sessionId: string;
	step: number;
};

function replacePageInPath( pathname: string, page: string ): string {
	if ( pathname.endsWith( '.html' ) ) {
		return pathname.replace( /[^/]+\.html$/, `${ page }.html` );
	}

	return pathname.replace( /[^/]+$/, page );
}

export function buildIframeUrl( baseUrl: string, session: BuildIframeUrlSession | null ): string {
	if ( ! baseUrl ) {
		return '';
	}

	if ( ! session?.sessionId?.trim() ) {
		return baseUrl;
	}

	const page = mapPlannerStepToPage( session.step );
	const url = new URL( baseUrl );
	url.pathname = replacePageInPath( url.pathname, page );
	url.search = '';
	url.searchParams.set( 'session', session.sessionId );

	return url.toString();
}
