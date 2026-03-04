import { generateElementId, type V1ElementData, type V1ElementSettingsProps } from '@elementor/editor-elements';
import { classesPropTypeUtil, type ClassesPropValue, type PropValue } from '@elementor/editor-props';
import { type StyleDefinition, type StyleDefinitionID } from '@elementor/editor-styles';

export function regenerateLocalStyleIds( element: V1ElementData ): {
	styles: Record< StyleDefinitionID, StyleDefinition > | undefined;
	settings: V1ElementSettingsProps | undefined;
} {
	const originalStyles = element.styles;

	if ( ! originalStyles || Object.keys( originalStyles ).length === 0 ) {
		return { styles: undefined, settings: undefined };
	}

	const newStyles: Record< string, StyleDefinition > = {};
	const styleIdMapping: Record< string, string > = {};

	for ( const [ originalStyleId, style ] of Object.entries( originalStyles ) ) {
		const newStyleId = generateLocalStyleId( element.id );

		newStyles[ newStyleId ] = { ...style, id: newStyleId };
		styleIdMapping[ originalStyleId ] = newStyleId;
	}

	const settings = element.settings;
	if ( ! settings || Object.keys( settings ).length === 0 ) {
		return { styles: newStyles, settings: undefined };
	}

	const updatedSettings = { ...settings };

	for ( const [ propKey, propValue ] of Object.entries( updatedSettings ) ) {
		if ( isClassesProp( propValue ) && propValue.value.length > 0 ) {
			const updatedClasses = propValue.value.map( ( classId ) => styleIdMapping[ classId ] ?? classId );

			updatedSettings[ propKey ] = classesPropTypeUtil.create( updatedClasses );
		}
	}

	return {
		styles: newStyles,
		settings: updatedSettings,
	};
}

function isClassesProp( prop: PropValue ): prop is ClassesPropValue {
	return classesPropTypeUtil.isValid( prop );
}

function generateLocalStyleId( elementId: string ): string {
	return `e-${ elementId }-${ generateElementId() }`;
}
