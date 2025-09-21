import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import { getElementSetting, updateElementSettings } from '@elementor/editor-elements';
import { classesPropTypeUtil, type ClassesPropValue } from '@elementor/editor-props';
import { type StyleDefinitionID } from '@elementor/editor-styles';

// Externalized for use outside of Hooks

export function doGetAppliedClasses( elementId: string, classesPropType = 'classes' ) {
	return getElementSetting< ClassesPropValue >( elementId, classesPropType )?.value || [];
}

export function doApplyClasses( elementId: string, classIds: StyleDefinitionID[], classesPropType = 'classes' ) {
	updateElementSettings( {
		id: elementId,
		props: { [ classesPropType ]: classesPropTypeUtil.create( classIds ) },
		withHistory: false,
	} );
	setDocumentModifiedStatus( true );
}

export function doUnapplyClass( elementId: string, classId: StyleDefinitionID, classesPropType = 'classes' ) {
	const appliedClasses = getElementSetting< ClassesPropValue >( elementId, classesPropType )?.value || [];
	if ( ! appliedClasses.includes( classId ) ) {
		throw new Error( `Class ${ classId } is not applied to element ${ elementId }, cannot unapply it.` );
	}

	const updatedClassIds = appliedClasses.filter( ( id ) => id !== classId );
	doApplyClasses( elementId, updatedClassIds, classesPropType );
}
