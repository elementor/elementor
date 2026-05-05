import { GLOBAL_STYLES_IMPORTED_EVENT, type ImportedGlobalStylesPayload } from '@elementor/editor-canvas';
import { reloadCurrentDocument } from '@elementor/editor-documents';
import { httpService } from '@elementor/http-client';
import { useMutation } from '@elementor/query';

import { type ConflictStrategy } from '../types';

const IMPORT_ENDPOINT = '/design-system/import';

export const IMPORT_DESIGN_SYSTEM_MUTATION_KEY = [ 'design-system-import' ] as const;

type ImportRequestArgs = {
	file: File;
	conflictStrategy: ConflictStrategy;
};

export const useImportRequest = () => {
	return useMutation( {
		mutationKey: [ ...IMPORT_DESIGN_SYSTEM_MUTATION_KEY ],
		mutationFn: async ( { file, conflictStrategy }: ImportRequestArgs ): Promise< void > => {
			const formData = new FormData();
			formData.append( 'file', file );
			formData.append( 'conflict_strategy', conflictStrategy );

			const response = await httpService().post< ImportedGlobalStylesPayload >( IMPORT_ENDPOINT, formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			} );

			window.dispatchEvent(
				new CustomEvent< ImportedGlobalStylesPayload >( GLOBAL_STYLES_IMPORTED_EVENT, {
					detail: response?.data,
				} )
			);

			await reloadCurrentDocument();
		},
	} );
};
