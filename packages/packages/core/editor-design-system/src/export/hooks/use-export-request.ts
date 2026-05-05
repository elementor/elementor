import { type HttpResponse, httpService } from '@elementor/http-client';
import { useMutation } from '@elementor/query';

const EXPORT_BASE_PATH = 'elementor/v1/import-export-customization';

export const EXPORT_DESIGN_SYSTEM_MUTATION_KEY = [ 'design-system-export' ] as const;

export const DEFAULT_EXPORT_FILE_NAME = 'design-system-export.zip';

const EXPORT_REQUEST_TIMEOUT_MS = 60_000;

export type ExportResponseData = {
	manifest?: unknown;
	file: string;
	media_urls?: unknown;
};

export type ExportRequestResult = {
	fileName: string;
	blob: Blob;
};

const EXPORT_REQUEST_BODY = {
	include: [ 'settings' ],
	kitInfo: {
		title: 'design-system',
		description: '',
		source: 'local',
	},
	customization: {
		settings: {
			theme: false,
			classes: true,
			variables: true,
		},
	},
} as const;

export class DesignSystemExportError extends Error {
	constructor( cause: unknown ) {
		super( 'Design system export failed' );
		this.name = 'DesignSystemExportError';
		this.cause = cause;
	}
}

export const useExportRequest = () => {
	return useMutation( {
		mutationKey: [ ...EXPORT_DESIGN_SYSTEM_MUTATION_KEY ],
		mutationFn: async (): Promise< ExportRequestResult > => {
			try {
				const { data } = await httpService().post< HttpResponse< ExportResponseData > >(
					`${ EXPORT_BASE_PATH }/export`,
					EXPORT_REQUEST_BODY,
					{ timeout: EXPORT_REQUEST_TIMEOUT_MS }
				);

				return {
					fileName: DEFAULT_EXPORT_FILE_NAME,
					blob: base64ToZipBlob( data.data.file ),
				};
			} catch ( error ) {
				throw new DesignSystemExportError( error );
			}
		},
	} );
};

const base64ToZipBlob = ( base64: string ): Blob => {
	const binary = atob( base64 );
	const bytes = new Uint8Array( binary.length );

	for ( let i = 0; i < binary.length; i++ ) {
		bytes[ i ] = binary.charCodeAt( i );
	}

	return new Blob( [ bytes ], { type: 'application/zip' } );
};
