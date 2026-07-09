import { GLOBAL_STYLES_IMPORTED_EVENT, type ImportedGlobalStylesPayload } from '@elementor/editor-canvas';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { type HttpResponse, httpService } from '@elementor/http-client';
import { useMutation } from '@elementor/query';

import { type ConflictStrategy } from '../types';

const IMPORT_BASE_PATH = 'elementor/v1/import-export-customization';

const IMPORT_REQUEST_TIMEOUT_MS = 120_000;

const GLOBAL_CLASSES_RUNNER = 'global-classes';
const GLOBAL_VARIABLES_RUNNER = 'global-variables';
const SUPPORTED_RUNNERS = [ GLOBAL_CLASSES_RUNNER, GLOBAL_VARIABLES_RUNNER ];

export const IMPORT_DESIGN_SYSTEM_MUTATION_KEY = 'design-system-import' as const;

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
		mutationKey: [ IMPORT_DESIGN_SYSTEM_MUTATION_KEY ],
		mutationFn: async ( { file, conflictStrategy }: ImportRequestArgs ): Promise< void > => {
			await runCommand( 'document/save/auto', { force: true } );

			const session = await uploadKit( file );
			const runners = await startImport( session, conflictStrategy );

			const importedClassIds = await runRunners( session, runners );

			window.dispatchEvent(
				new CustomEvent< ImportedGlobalStylesPayload | undefined >( GLOBAL_STYLES_IMPORTED_EVENT, {
					detail: importedClassIds.length ? { imported_class_ids: importedClassIds } : undefined,
				} )
			);
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
			conflict_resolution: conflictStrategy === 'keep' ? 'skip' : 'replace',
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

type ImportedClassEntry = {
	result_entry?: { id: string; label: string };
};

type ImportedClassesSection = {
	created?: ImportedClassEntry[];
	renamed?: ImportedClassEntry[];
};

type RunnerResponseData = ImportedClassesSection & {
	imported_data?: ImportedClassesSection;
};

type SeenCounts = { created: number; renamed: number };

// The `global-classes` runner returns the newly created classes as part of `imported_data`, which accumulates
// across every runner call in the session. Only entries beyond what was already seen before this runner ran
// belong to it, since a later runner (e.g. `global-variables`) may append its own entries under the same keys.
const getNewEntriesSinceLastCall = (
	section: ImportedClassesSection | undefined,
	seenCounts: SeenCounts
): { newEntries: ImportedClassEntry[]; seenCounts: SeenCounts } => {
	const created = section?.created ?? [];
	const renamed = section?.renamed ?? [];

	return {
		newEntries: [ ...created.slice( seenCounts.created ), ...renamed.slice( seenCounts.renamed ) ],
		seenCounts: { created: created.length, renamed: renamed.length },
	};
};

const runRunners = async ( session: string, runners: string[] ): Promise< string[] > => {
	let seenCounts: SeenCounts = { created: 0, renamed: 0 };
	let importedClassIds: string[] = [];

	for ( const runner of runners ) {
		const { data } = await httpService().post< HttpResponse< RunnerResponseData > >(
			`${ IMPORT_BASE_PATH }/import-runner`,
			{ session, runner },
			{ timeout: IMPORT_REQUEST_TIMEOUT_MS }
		);

		const importedDataSection = data.data.imported_data ?? data.data;
		const { newEntries, seenCounts: nextSeenCounts } = getNewEntriesSinceLastCall(
			importedDataSection,
			seenCounts
		);
		seenCounts = nextSeenCounts;

		if ( runner === GLOBAL_CLASSES_RUNNER ) {
			importedClassIds = newEntries
				.map( ( entry ) => entry.result_entry?.id )
				.filter( ( id ): id is string => Boolean( id ) );
		}
	}

	return importedClassIds;
};
