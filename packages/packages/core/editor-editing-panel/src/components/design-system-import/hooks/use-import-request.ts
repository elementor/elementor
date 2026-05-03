import { reloadCurrentDocument } from '@elementor/editor-documents';
import { httpService } from '@elementor/http-client';
import { useMutation } from '@elementor/query';

import { type ConflictStrategy } from '../types';

const IMPORT_ENDPOINT = '/design-system/import';
const GLOBAL_STYLES_IMPORTED_EVENT = 'elementor/global-styles/imported';

export const IMPORT_DESIGN_SYSTEM_MUTATION_KEY = [ 'design-system-import' ] as const;

// TEMP: artificial delay so the in-progress state is visible during manual QA. Remove before merging.
const QA_DELAY_MS = 3000;

type ImportRequestArgs = {
	file: File;
	conflictStrategy: ConflictStrategy;
};

const wait = ( ms: number ): Promise< void > => new Promise( ( resolve: () => void ) => setTimeout( resolve, ms ) );

const broadcastGlobalStylesImported = ( detail: unknown ) => {
	window.dispatchEvent( new CustomEvent( GLOBAL_STYLES_IMPORTED_EVENT, { detail } ) );
};

export const useImportRequest = () => {
	return useMutation( {
		mutationKey: [ ...IMPORT_DESIGN_SYSTEM_MUTATION_KEY ],
		mutationFn: async ( { file, conflictStrategy }: ImportRequestArgs ): Promise< void > => {
			const formData = new FormData();
			formData.append( 'file', file );
			formData.append( 'conflict_strategy', conflictStrategy );

			await wait( QA_DELAY_MS );

			const response = await httpService().post( IMPORT_ENDPOINT, formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			} );

			broadcastGlobalStylesImported( response?.data );

			await reloadCurrentDocument();
		},
	} );
};
