import { injectIntoPrimaryAction } from '../../locations';
import PrimaryAction from './components/primary-action';
import useDocumentCopyAndShareProps from './hooks/use-document-copy-and-share-props';
import useDocumentSaveDraftProps from './hooks/use-document-save-draft-props';
import useDocumentSaveTemplateProps from './hooks/use-document-save-template-props';
import useDocumentViewPageProps from './hooks/use-document-view-page-props';
import { documentOptionsMenu } from './locations';

export function init() {
	injectIntoPrimaryAction( {
		id: 'document-primary-action',
		component: PrimaryAction,
	} );

	documentOptionsMenu.registerAction( {
		group: 'save',
		id: 'document-save-draft',
		priority: 10,
		useProps: useDocumentSaveDraftProps,
	} );

	documentOptionsMenu.registerAction( {
		group: 'save',
		id: 'document-save-as-template',
		priority: 20,
		useProps: useDocumentSaveTemplateProps,
	} );

	documentOptionsMenu.registerAction( {
		id: 'document-copy-and-share',
		priority: 10,
		useProps: useDocumentCopyAndShareProps,
	} );

	documentOptionsMenu.registerAction( {
		id: 'document-view-page',
		priority: 50,
		useProps: useDocumentViewPageProps,
	} );
}
