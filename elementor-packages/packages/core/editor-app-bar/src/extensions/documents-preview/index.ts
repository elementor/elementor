import { utilitiesMenu } from '../../locations';
import useDocumentPreviewProps from './hooks/use-action-props';

export function init() {
	utilitiesMenu.registerAction( {
		id: 'document-preview-button',
		priority: 30, // After help.
		useProps: useDocumentPreviewProps,
	} );
}
