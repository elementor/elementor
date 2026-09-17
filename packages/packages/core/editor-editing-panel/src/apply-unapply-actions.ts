import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import { getElementSetting, updateElementSettings } from '@elementor/editor-elements';
import { classesPropTypeUtil, type ClassesPropValue } from '@elementor/editor-props';
import { type StyleDefinitionID } from '@elementor/editor-styles';
import { stylesRepository } from '@elementor/editor-styles-repository';

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

	ensureClassesAreLoaded( classIds );
}

function ensureClassesAreLoaded( classIds: StyleDefinitionID[] ) {
	const providers = stylesRepository.getProviders();

	classIds.forEach( ( classId ) => {
		stylesRepository.getProviderByKey( classId )?.actions.get( classId );
		const owningProvider = providers.find( ( provider ) =>
			provider.actions.all().some( ( style ) => style.id === classId )
		);

		try {
			// this is essentially to enforce the loading of a class if we have async lazy-loading style providers, e.g. global classes
			owningProvider?.actions.get( classId );
		} catch {}
	} );
}

export function doUnapplyClass( elementId: string, classId: StyleDefinitionID, classesPropType = 'classes' ) {
	const appliedClasses = getElementSetting< ClassesPropValue >( elementId, classesPropType )?.value || [];
	if ( ! appliedClasses.includes( classId ) ) {
		return false;
	}

	const updatedClassIds = appliedClasses.filter( ( id: StyleDefinitionID ) => id !== classId );
	doApplyClasses( elementId, updatedClassIds, classesPropType );
	return true;
}
