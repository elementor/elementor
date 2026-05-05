import { GLOBAL_STYLES_IMPORTED_EVENT } from '@elementor/editor-canvas';
import { reloadCurrentDocument } from '@elementor/editor-documents';
import { type HttpResponse, httpService } from '@elementor/http-client';
import { useMutation } from '@elementor/query';

import { type ConflictStrategy } from '../types';

const IMPORT_BASE_PATH = 'elementor/v1/import-export-customization';

const IMPORT_REQUEST_TIMEOUT_MS = 20_000;

const CONFLICT_RESOLUTION_BY_STRATEGY: Record< ConflictStrategy, 'replace' | 'skip' > = {
	replace: 'replace',
	keep: 'skip',
};

const GLOBAL_CLASSES_RUNNER = 'global-classes';
const GLOBAL_VARIABLES_RUNNER = 'global-variables';
const SUPPORTED_RUNNERS = [ GLOBAL_CLASSES_RUNNER, GLOBAL_VARIABLES_RUNNER ];

export const IMPORT_DESIGN_SYSTEM_MUTATION_KEY = [ 'design-system-import' ] as const;

type UploadResponseData = {
	session: string;
};

type ImportResponseData = {
	session: string;
	runners?: string[];
};

type ImportRequestArgs = {
	file: File;
	conflictStrategy: ConflictStrategy;
};

export const useImportRequest = () => {
	return useMutation( {
		mutationKey: [ ...IMPORT_DESIGN_SYSTEM_MUTATION_KEY ],
		mutationFn: async ( { file, conflictStrategy }: ImportRequestArgs ): Promise< void > => {
			const session = await uploadKit( file );
			const runners = await startImport( session, conflictStrategy );

			await runRunners( session, runners );

			await reloadCurrentDocument();

			window.dispatchEvent( new CustomEvent( GLOBAL_STYLES_IMPORTED_EVENT ) );
		},
	} );
};

export class DesignSystemUploadValidationError extends Error {
	constructor( cause: unknown ) {
		super( 'Design system upload validation failed' );
		this.name = 'DesignSystemUploadValidationError';
		this.cause = cause;
	}
}

const uploadKit = async ( file: File ): Promise< string > => {
	const formData = new FormData();
	formData.append( 'e_import_file', file );

	try {
		const { data } = await httpService().post< HttpResponse< UploadResponseData > >(
			`${ IMPORT_BASE_PATH }/upload`,
			formData,
			{ headers: { 'Content-Type': 'multipart/form-data' }, timeout: IMPORT_REQUEST_TIMEOUT_MS }
		);

		return data.data.session;
	} catch ( error ) {
		throw new DesignSystemUploadValidationError( error );
	}
};

const startImport = async ( session: string, conflictStrategy: ConflictStrategy ): Promise< string[] > => {
	const customization = {
		'design-system': {
			conflict_resolution: CONFLICT_RESOLUTION_BY_STRATEGY[ conflictStrategy ],
		},
	};

	const { data } = await httpService().post< HttpResponse< ImportResponseData > >(
		`${ IMPORT_BASE_PATH }/import`,
		{
			session,
			include: [ 'design-system' ],
			customization,
		},
		{ timeout: IMPORT_REQUEST_TIMEOUT_MS }
	);

	return ( data.data.runners ?? [] ).filter( ( runner ) => SUPPORTED_RUNNERS.includes( runner ) );
};

const runRunners = async ( session: string, runners: string[] ): Promise< void > => {
	for ( const runner of runners ) {
		await httpService().post(
			`${ IMPORT_BASE_PATH }/import-runner`,
			{ session, runner },
			{ timeout: IMPORT_REQUEST_TIMEOUT_MS }
		);
	}
};
