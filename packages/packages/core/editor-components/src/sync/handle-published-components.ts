import { invalidateComponentDocumentData } from '../utils/component-document-data';

type OperationResult = {
	successIds: number[];
	failed: Array< { id: number; error: string } >;
};

export function handlePublishedComponents( result: OperationResult ): void {
	result.successIds.forEach( ( id ) => invalidateComponentDocumentData( id ) );
}
