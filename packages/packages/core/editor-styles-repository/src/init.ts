import { documentElementsStylesProvider } from './providers/document-elements-styles-provider';
import { elementBaseStylesProvider } from './providers/element-base-styles-provider';
import { stylesRepository } from './styles-repository';

export function init() {
	stylesRepository.register( documentElementsStylesProvider );
	stylesRepository.register( elementBaseStylesProvider );
}
