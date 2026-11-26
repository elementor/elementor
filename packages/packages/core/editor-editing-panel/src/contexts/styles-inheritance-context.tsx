import * as React from 'react';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import { classesPropTypeUtil, type ClassesPropValue, type PropValue } from '@elementor/editor-props';
import { getBreakpointsTree } from '@elementor/editor-responsive';
import { getStylesSchema } from '@elementor/editor-styles';

import { useDefaultStyleTagFromPreview } from '../hooks/use-default-style-tag-from-preview';
import { useStylesRerender } from '../hooks/use-styles-rerender';
import { createStylesInheritance } from '../styles-inheritance/create-styles-inheritance';
import { getAppliedStyles } from '../styles-inheritance/get-applied-styles';
import {
	type SnapshotPropValue,
	type StylesInheritanceAPI,
	type StylesInheritanceSnapshot,
} from '../styles-inheritance/types';
import { useClassesProp } from './classes-prop-context';
import { useElement, usePanelElementSetting } from './element-context';
import { useStyle } from './style-context';

const Context = createContext< StylesInheritanceAPI | null >( null );

export function StyleInheritanceProvider( { children }: PropsWithChildren ) {
	const styleDefs = useAppliedStyles();

	const breakpointsTree = getBreakpointsTree();

	const { getSnapshot, getInheritanceChain } = createStylesInheritance( styleDefs, breakpointsTree );

	return <Context.Provider value={ { getSnapshot, getInheritanceChain } }>{ children }</Context.Provider>;
}

export function useStylesInheritanceSnapshot(): StylesInheritanceSnapshot | null {
	const context = useContext( Context );
	const { meta } = useStyle();

	if ( ! context ) {
		throw new Error( 'useStylesInheritanceSnapshot must be used within a StyleInheritanceProvider' );
	}

	if ( ! meta ) {
		return null;
	}

	return context.getSnapshot( meta ) ?? null;
}

export function useStylesInheritanceChain( path: string[] ): SnapshotPropValue[] {
	const context = useContext( Context );

	if ( ! context ) {
		throw new Error( 'useStylesInheritanceChain must be used within a StyleInheritanceProvider' );
	}

	const schema = getStylesSchema();

	const topLevelPropType = schema?.[ path[ 0 ] ];

	const snapshot = useStylesInheritanceSnapshot();

	if ( ! snapshot ) {
		return [];
	}

	return context.getInheritanceChain( snapshot, path, topLevelPropType );
}

const EMPTY_INHERITED_VALUES: Record< string, PropValue > = {};

export function useInheritedValues( propKeys: string[] ): Record< string, PropValue > {
	const snapshot = useStylesInheritanceSnapshot();

	return useMemo( () => {
		if ( ! snapshot || propKeys.length === 0 ) {
			return EMPTY_INHERITED_VALUES;
		}

		return Object.fromEntries( propKeys.map( ( key ) => [ key, snapshot[ key ]?.[ 0 ]?.value ?? null ] ) );
	}, [ snapshot, propKeys ] );
}

const useAppliedStyles = () => {
	const currentClassesProp = useClassesProp();
	const { elementType } = useElement();
	const defaultTagStyleId = useDefaultTagStyleId();
	const { id: activeStyleId } = useStyle();

	useStylesRerender();

	const classesProp = usePanelElementSetting< ClassesPropValue >( currentClassesProp );

	return getAppliedStyles( {
		elementTypeKey: elementType.key,
		appliedStyleIds: classesPropTypeUtil.extract( classesProp ) ?? [],
		defaultTagStyleId,
		activeStyleId,
	} );
};

const useDefaultTagStyleId = () => {
	const { element } = useElement();

	return useDefaultStyleTagFromPreview( element.id );
};
