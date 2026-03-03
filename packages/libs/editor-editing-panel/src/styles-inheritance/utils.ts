import { type BreakpointId } from '@elementor/editor-responsive';
import { type StyleDefinitionState, type StyleDefinitionVariant } from '@elementor/editor-styles';

import { type SnapshotPropValue } from './types';

export const DEFAULT_STATE = 'normal';

const DEFAULT_BREAKPOINT = 'desktop';

export const getStateKey = ( state: StyleDefinitionState ) => state ?? DEFAULT_STATE;

export const getBreakpointKey = ( breakpoint: BreakpointId | null ): BreakpointId => breakpoint ?? DEFAULT_BREAKPOINT;

export const getValueFromInheritanceChain = (
	inheritanceChain: SnapshotPropValue[],
	styleId: string,
	meta: StyleDefinitionVariant[ 'meta' ]
) =>
	inheritanceChain.find(
		( {
			style,
			variant: {
				meta: { breakpoint, state },
			},
		} ) => style.id === styleId && breakpoint === meta.breakpoint && state === meta.state
	);
