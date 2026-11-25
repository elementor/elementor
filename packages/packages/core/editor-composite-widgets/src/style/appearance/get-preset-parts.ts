import { getLocalStyleTargets, type StyleTarget } from '@elementor/editor-editing-panel';
import { type ElementID, getContainer } from '@elementor/editor-elements';

import { findWidgetPart } from '../../general/find-widget-part';
import { type CompositeWidgetPreset } from '../../types';
import { getNormalStatePropsByBreakpoint, type PropsByBreakpoint } from './resolve-breakpoint-value';

export type PresetPart = {
	target: StyleTarget;
	propsByBreakpoint: PropsByBreakpoint;
};

export type PresetParts = Partial< Record< string, PresetPart > >;

export function getPresetParts( rootId: ElementID, preset: CompositeWidgetPreset ): PresetParts {
	const root = getContainer( rootId );

	if ( ! root ) {
		return {};
	}

	return Object.fromEntries(
		getPresetPartNames( preset ).flatMap( ( part ) => {
			const container = findWidgetPart( root, part );
			const [ target ] = container ? getLocalStyleTargets( [ container.id ] ) : [];

			return target ? [ [ part, { target, propsByBreakpoint: getTargetPropsByBreakpoint( target ) } ] ] : [];
		} )
	);
}

function getPresetPartNames( preset: CompositeWidgetPreset ): string[] {
	const parts = preset.options.flatMap( ( option ) => option.set.map( ( { part } ) => part ) );

	return [ ...new Set( parts ) ];
}

function getTargetPropsByBreakpoint( { elementId, styleId, provider }: StyleTarget ): PropsByBreakpoint {
	const style = styleId && provider ? provider.actions.get( styleId, { elementId } ) : null;

	return getNormalStatePropsByBreakpoint( style?.variants ?? [] );
}
