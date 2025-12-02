export { init } from './init';

export {
	useActiveDocument as __useActiveDocument,
	useNavigateToDocument as __useNavigateToDocument,
	useHostDocument as __useHostDocument,
	useActiveDocumentActions as __useActiveDocumentActions,
	useOpenDocumentInNewTab as __useOpenDocumentInNewTab,
} from './hooks';

export { slice } from './store';

export { getCurrentDocument } from './store/get-current-document';

export { setDocumentModifiedStatus, getV1DocumentsManager, getV1CurrentDocument, isDocumentDirty } from './sync/utils';

export * from './types';
