import https from 'node:https';
import {
	EDITOR_PROMOTION_CDN_ENDPOINTS,
	EDITOR_PROMOTION_CDN_FETCH_TIMEOUT_MS,
	EDITOR_PROMOTIONS_CDN_BASE_URL,
} from './editor-promotion-cdn-endpoints';
import {
	type EditorPromotionCdnValidationIssue,
	validateEditorPromotionCdnDocument,
} from './validate-editor-promotion-cdn-response';

export type FetchEditorPromotionCdnResult = {
	endpointPath: string;
	ok: boolean;
	issues: EditorPromotionCdnValidationIssue[];
};

export type FetchEditorPromotionCdnSummary = {
	baseUrl: string;
	results: FetchEditorPromotionCdnResult[];
};

const fetchEditorPromotionDocument = ( endpointPath: string, baseUrl: string ): Promise<{ document: unknown | null; fetchError: string | null }> => {
	const url = `${ baseUrl.replace( /\/$/, '' ) }/${ endpointPath }`;

	return new Promise( ( resolve ) => {
		const request = https.get(
			url,
			{
				headers: { Accept: 'application/json' },
				timeout: EDITOR_PROMOTION_CDN_FETCH_TIMEOUT_MS,
			},
			( response ) => {
				if ( 200 !== response.statusCode ) {
					resolve( {
						document: null,
						fetchError: `HTTP ${ response.statusCode ?? 'unknown' }`,
					} );
					response.resume();
					return;
				}

				let body = '';

				response.setEncoding( 'utf8' );
				response.on( 'data', ( chunk: string ) => {
					body += chunk;
				} );
				response.on( 'end', () => {
					try {
						resolve( { document: JSON.parse( body ), fetchError: null } );
					} catch {
						resolve( {
							document: null,
							fetchError: 'Response body is not valid JSON.',
						} );
					}
				} );
			},
		);

		request.on( 'timeout', () => {
			request.destroy();
			resolve( {
				document: null,
				fetchError: `Request timed out after ${ EDITOR_PROMOTION_CDN_FETCH_TIMEOUT_MS }ms`,
			} );
		} );

		request.on( 'error', ( error ) => {
			resolve( {
				document: null,
				fetchError: error.message,
			} );
		} );
	} );
};

export const fetchAndValidateEditorPromotionCdn = async (
	baseUrl: string = EDITOR_PROMOTIONS_CDN_BASE_URL,
): Promise<FetchEditorPromotionCdnSummary> => {
	const results: FetchEditorPromotionCdnResult[] = [];

	for ( const endpoint of EDITOR_PROMOTION_CDN_ENDPOINTS ) {
		const { document, fetchError } = await fetchEditorPromotionDocument( endpoint.path, baseUrl );

		if ( fetchError ) {
			results.push( {
				endpointPath: endpoint.path,
				ok: false,
				issues: [
					{
						endpointPath: endpoint.path,
						message: fetchError,
					},
				],
			} );
			continue;
		}

		const issues = validateEditorPromotionCdnDocument( endpoint, document );

		results.push( {
			endpointPath: endpoint.path,
			ok: 0 === issues.length,
			issues,
		} );
	}

	return {
		baseUrl,
		results,
	};
};

const formatSummaryForConsole = ( summary: FetchEditorPromotionCdnSummary ): string => {
	const lines = [ `Editor promotions CDN validation (${ summary.baseUrl })` ];

	for ( const result of summary.results ) {
		if ( result.ok ) {
			lines.push( `OK  ${ result.endpointPath }` );
			continue;
		}

		lines.push( `FAIL ${ result.endpointPath }` );

		for ( const issue of result.issues ) {
			lines.push( `  - ${ issue.message }` );
		}
	}

	return lines.join( '\n' );
};

export const runEditorPromotionCdnCli = async (): Promise<number> => {
	const envBaseUrl = process.env.EDITOR_PROMOTIONS_CDN_BASE_URL?.trim();
	const baseUrl = envBaseUrl && envBaseUrl.length > 0 ? envBaseUrl : EDITOR_PROMOTIONS_CDN_BASE_URL;
	const summary = await fetchAndValidateEditorPromotionCdn( baseUrl );

	process.stdout.write( `${ formatSummaryForConsole( summary ) }\n` );

	return summary.results.some( ( result ) => ! result.ok ) ? 1 : 0;
};

if ( require.main === module ) {
	void runEditorPromotionCdnCli().then( ( exitCode ) => process.exit( exitCode ) );
}
