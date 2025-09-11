import { __registerSlice as registerSlice } from '@elementor/store';

import { documentElementsStylesProvider } from './providers/document-elements-styles-provider';
import { elementBaseStylesProvider } from './providers/element-base-styles-provider';
import { initialDocumentsStylesProvider } from './providers/inital-documents-styles-provider';
import { slice } from './store/initial-documents-styles-store';
import { stylesRepository } from './styles-repository';

export function init() {
	stylesRepository.register( documentElementsStylesProvider );
	stylesRepository.register( elementBaseStylesProvider );
	stylesRepository.register( initialDocumentsStylesProvider );

	registerSlice( slice );
}
