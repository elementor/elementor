import { getCurrentDocument, getV1DocumentsManager } from '@elementor/editor-documents';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { service as variablesService } from '@elementor/editor-variables';
import { httpService } from '@elementor/http-client';
import { useMutation } from '@elementor/query';

import { type ConflictStrategy, type ImportResult } from '../types';

const PLACEHOLDER_ENDPOINT = '/design-system/import';
const GLOBAL_STYLES_IMPORTED_EVENT = 'elementor/global-styles/imported';

export const IMPORT_DESIGN_SYSTEM_MUTATION_KEY = [ 'design-system-import' ] as const;

// TEMP: artificial delay so the in-progress state is visible during manual QA. Remove before merging.
const QA_DELAY_MS = 3000;

type ImportRequestArgs = {
	file: File;
	conflictStrategy: ConflictStrategy;
};

const wait = ( ms: number ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );

const reloadCurrentDocument = () => {
	const current = getCurrentDocument();

	if ( ! current?.id ) {
		return Promise.resolve();
	}

	getV1DocumentsManager().invalidateCache();

	return runCommand( 'editor/documents/switch', {
		id: current.id,
		shouldScroll: false,
		shouldNavigateToDefaultRoute: false,
	} );
};

const broadcastGlobalStylesImported = ( detail: unknown ) => {
	window.dispatchEvent( new CustomEvent( GLOBAL_STYLES_IMPORTED_EVENT, { detail } ) );
};

export const useImportRequest = () => {
	return useMutation( {
		mutationKey: [ ...IMPORT_DESIGN_SYSTEM_MUTATION_KEY ],
		mutationFn: async ( { file, conflictStrategy }: ImportRequestArgs ): Promise< ImportResult > => {
			const formData = new FormData();
			formData.append( 'file', file );
			formData.append( 'conflict_strategy', conflictStrategy );

			await wait( QA_DELAY_MS );

			const response = await httpService().post( PLACEHOLDER_ENDPOINT, formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			} );

			broadcastGlobalStylesImported( response?.data );

			await variablesService.load();

			await reloadCurrentDocument();

			return {
				successfulCount: response?.data?.successful_count ?? 0,
				unsuccessfulCount: response?.data?.unsuccessful_count ?? 0,
			};
		},
	} );
};
