import { type OperationResult } from '../api';
import { invalidateComponentDocumentData } from '../utils/component-document-data';

export function handlePublishedComponents( result: OperationResult ): void {
	result.successIds.forEach( ( id ) => invalidateComponentDocumentData( id ) );
}
