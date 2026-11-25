import { type ElementID, getContainer, getElementType } from '@elementor/editor-elements';
import { CLASSES_PROP_KEY } from '@elementor/editor-props';
import { type StyleDefinitionID } from '@elementor/editor-styles';
import { isElementsStylesProvider, type StylesProvider, stylesRepository } from '@elementor/editor-styles-repository';

export type ElementLocalStyle = {
	styleId: StyleDefinitionID;
	provider: StylesProvider;
};

export function getElementLocalStyle( elementId: ElementID ): ElementLocalStyle | null {
	const provider = stylesRepository
		.getProviders()
		.find( ( stylesProvider ) => isElementsStylesProvider( stylesProvider.getKey() ) );
	const [ style ] = provider?.actions.all( { elementId } ) ?? [];

	return provider && style ? { styleId: style.id, provider } : null;
}

export function getElementClassesProp( elementId: ElementID ): string | null {
	const container = getContainer( elementId );
	const type = container?.model.get( 'widgetType' ) || container?.model.get( 'elType' );
	const propsSchema = type ? getElementType( type )?.propsSchema : null;

	const classesEntry = Object.entries( propsSchema ?? {} ).find(
		( [ , propType ] ) => propType.kind === 'plain' && propType.key === CLASSES_PROP_KEY
	);

	return classesEntry?.[ 0 ] ?? null;
}
