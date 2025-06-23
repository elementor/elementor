import * as React from 'react';
import { createContext, type PropsWithChildren, useContext } from 'react';
import { getWidgetsCache, useElementSetting } from '@elementor/editor-elements';
import { classesPropTypeUtil, type ClassesPropValue } from '@elementor/editor-props';
import { getBreakpointsTree } from '@elementor/editor-responsive';
import { getStylesSchema } from '@elementor/editor-styles';
import { stylesRepository } from '@elementor/editor-styles-repository';

import { useStylesRerender } from '../hooks/use-styles-rerender';
import { createStylesInheritance } from '../styles-inheritance/create-styles-inheritance';
import {
	type SnapshotPropValue,
	type StylesInheritanceAPI,
	type StylesInheritanceSnapshot,
} from '../styles-inheritance/types';
import { useClassesProp } from './classes-prop-context';
import { useElement } from './element-context';
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

const useAppliedStyles = () => {
	const { element } = useElement();
	const currentClassesProp = useClassesProp();
	const baseStyles = useBaseStyles();

	useStylesRerender();

	const classesProp = useElementSetting< ClassesPropValue >( element.id, currentClassesProp );

	const appliedStyles = classesPropTypeUtil.extract( classesProp ) ?? [];

	return stylesRepository.all().filter( ( style ) => [ ...baseStyles, ...appliedStyles ].includes( style.id ) );
};

const useBaseStyles = () => {
	const { elementType } = useElement();
	const widgetsCache = getWidgetsCache();
	const widgetCache = widgetsCache?.[ elementType.key ];

	return Object.keys( widgetCache?.base_styles ?? {} );
};
