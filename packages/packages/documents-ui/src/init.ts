import PrimaryAction from './components/top-bar/primary-action';
import useDocumentPreviewProps from './hooks/use-document-preview-props';
import useDocumentSaveDraftProps from './hooks/use-document-save-draft-props';
import useDocumentSaveTemplateProps from './hooks/use-document-save-template-props';
import { injectIntoPrimaryAction, utilitiesMenu } from '@elementor/top-bar';
import { documentOptionsMenu } from './menus';

export default function init() {
	registerTopBarMenuItems();
}

function registerTopBarMenuItems() {
	injectIntoPrimaryAction( {
		name: 'document-primary-action',
		filler: PrimaryAction,
	} );

	utilitiesMenu.registerAction( {
		name: 'document-preview-button',
		priority: 30, // After help.
		useProps: useDocumentPreviewProps,
	} );

	documentOptionsMenu.registerAction( {
		group: 'save',
		name: 'document-save-draft',
		priority: 10, // Before save as template.
		useProps: useDocumentSaveDraftProps,
	} );

	documentOptionsMenu.registerAction( {
		group: 'save',
		name: 'document-save-as-template',
		priority: 20, // After save draft.
		useProps: useDocumentSaveTemplateProps,
	} );
}
