import { getContainer, getElementSetting, getElementStyles } from '@elementor/editor-elements';
import { classesPropTypeUtil, type ClassesPropValue } from '@elementor/editor-props';
import { type StyleDefinitionID } from '@elementor/editor-styles';
import {
	ELEMENTS_STYLES_RESERVED_LABEL,
	stylesRepository,
	type StylesProvider,
} from '@elementor/editor-styles-repository';
import { getSessionStorageItem } from '@elementor/session';

import { getClassesProp } from '../utils/command-utils';

const ACTIVE_STYLE_SESSION_KEY = 'active-style-id';

export type ActiveStyleTarget = {
	styleId: StyleDefinitionID | null;
	provider: StylesProvider | null;
	classesProp: string;
};

export function getActiveStyleSessionLookup( elementId: string ) {
	return `elementor/editor-state/${ elementId }/${ ACTIVE_STYLE_SESSION_KEY }`;
}

export function resolveActiveStyleTarget( elementId: string ): ActiveStyleTarget | null {
	const container = getContainer( elementId );

	if ( ! container ) {
		return null;
	}

	const classesProp = getClassesProp( container );

	if ( ! classesProp ) {
		return null;
	}

	const storedActiveId = getSessionStorageItem< StyleDefinitionID | null >( getActiveStyleSessionLookup( elementId ) );
	const appliedClassesIds = getAppliedClassIds( elementId, classesProp );
	const validAppliedClassIds = filterKnownClassIds( appliedClassesIds );
	const fallbackStyleId = getLastAppliedLocalStyleId( elementId, appliedClassesIds );
	const activeStyleId =
		getActiveAppliedClassId( storedActiveId ?? null, validAppliedClassIds ) ??
		fallbackStyleId ??
		getReservedLocalStyleId( elementId, classesProp ) ??
		null;

	const provider = activeStyleId ? getProviderForStyleId( activeStyleId, elementId ) : null;

	return {
		styleId: activeStyleId,
		provider,
		classesProp,
	};
}

function getAppliedClassIds( elementId: string, classesProp: string ) {
	const classesSetting = getElementSetting< ClassesPropValue >( elementId, classesProp );

	return classesSetting?.value ?? [];
}

function filterKnownClassIds( classIds: string[] ) {
	const knownIds = new Set(
		stylesRepository.getProviders().flatMap( ( provider ) => provider.actions.all().map( ( style ) => style.id ) )
	);

	return classIds.filter( ( id ) => knownIds.has( id ) );
}

function getLastAppliedLocalStyleId( elementId: string, appliedClassIds: string[] ) {
	const styleDefs = getElementStyles( elementId ) ?? {};

	for ( let index = appliedClassIds.length - 1; index >= 0; index -= 1 ) {
		const styleId = appliedClassIds[ index ];

		if ( styleDefs[ styleId ] ) {
			return styleId;
		}
	}

	return null;
}

function getActiveAppliedClassId( styleId: StyleDefinitionID | null, appliedClassIds: string[] ) {
	return styleId && appliedClassIds.includes( styleId ) ? styleId : null;
}

function getReservedLocalStyleId( elementId: string, classesProp: string ) {
	const styles = getElementStyles( elementId ) ?? {};
	const appliedClassIds = getAppliedClassIds( elementId, classesProp );

	for ( let index = appliedClassIds.length - 1; index >= 0; index -= 1 ) {
		const styleId = appliedClassIds[ index ];
		const style = styles[ styleId ];

		if ( style?.label === ELEMENTS_STYLES_RESERVED_LABEL ) {
			return styleId;
		}
	}

	return (
		Object.values( styles ).find( ( style ) => style.label === ELEMENTS_STYLES_RESERVED_LABEL )?.id ?? null
	);
}

export function getProviderForStyleId( styleId: StyleDefinitionID, elementId: string ) {
	for ( const provider of stylesRepository.getProviders() ) {
		const style = tryGetStyleFromProvider( provider, styleId, elementId );

		if ( style ) {
			return provider;
		}
	}

	return null;
}

function tryGetStyleFromProvider( provider: StylesProvider, styleId: StyleDefinitionID, elementId: string ) {
	try {
		return provider.actions.get( styleId, { elementId } ) ?? null;
	} catch {
		try {
			return provider.actions.get( styleId ) ?? null;
		} catch {
			return null;
		}
	}
}

export function getAppliedClassesForElement( elementId: string, classesProp: string ) {
	return classesPropTypeUtil.extract( getElementSetting( elementId, classesProp ) ) ?? [];
}
