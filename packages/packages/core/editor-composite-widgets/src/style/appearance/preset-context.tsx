import * as React from 'react';
import { createContext, type PropsWithChildren, useContext } from 'react';
import { type ElementID } from '@elementor/editor-elements';
import { type BreakpointId, useActiveBreakpoint } from '@elementor/editor-responsive';

import { type CompositeWidgetPreset } from '../../types';
import { applyPreset } from './apply-preset';
import { usePresetMatch } from './use-preset-match';

const DESKTOP_BREAKPOINT: BreakpointId = 'desktop';

type PresetContextValue = {
	preset: CompositeWidgetPreset;
	matchedOptionId: string | null;
	apply: ( optionId: string ) => void;
};

const PresetContext = createContext< PresetContextValue | null >( null );

type PresetProviderProps = PropsWithChildren< {
	rootId: ElementID;
	preset: CompositeWidgetPreset;
} >;

export function PresetProvider( { rootId, preset, children }: PresetProviderProps ) {
	const breakpoint = useActiveBreakpoint() ?? DESKTOP_BREAKPOINT;
	const matchedOptionId = usePresetMatch( rootId, preset, breakpoint );
	const apply = ( optionId: string ) => applyPreset( { rootId, preset, optionId, breakpoint } );

	return <PresetContext.Provider value={ { preset, matchedOptionId, apply } }>{ children }</PresetContext.Provider>;
}

export function usePreset(): PresetContextValue {
	const context = useContext( PresetContext );

	if ( ! context ) {
		throw new Error( 'usePreset must be used within a PresetProvider' );
	}

	return context;
}
