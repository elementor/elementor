import { filterEmptyValues } from '@elementor/editor-props';
import { type BreakpointId, type BreakpointNode } from '@elementor/editor-responsive';
import { type StyleDefinitionState } from '@elementor/editor-styles';

import {
	type BreakpointsInheritancePath,
	type BreakpointsStatesSnapshotsMapping,
	type BreakpointStatesSlotsMapping,
	type SnapshotPropValue,
	type StyleInheritanceMetaProps,
	type StylesInheritanceSnapshot,
	type StylesInheritanceSnapshotGetter,
	type StylesInheritanceSnapshotsSlot,
	type StyleVariantDetails,
} from './types';
import { DEFAULT_STATE, getBreakpointKey, getStateKey } from './utils';

export function createSnapshotsManager(
	getStylesByMeta: ( meta: StyleInheritanceMetaProps ) => StyleVariantDetails[],
	breakpointsRoot: BreakpointNode
): StylesInheritanceSnapshotGetter {
	const breakpointsInheritancePaths = makeBreakpointsInheritancePaths( breakpointsRoot );
	const allBreakpointStatesSnapshots: BreakpointsStatesSnapshotsMapping = {};

	const buildMissingSnapshotsForBreakpoint = (
		currentBreakpointId: BreakpointId | null,
		parentBreakpoint: BreakpointStatesSlotsMapping | undefined,
		state: StyleDefinitionState
	) => {
		const currentBreakpointKey = getBreakpointKey( currentBreakpointId );
		const stateKey = getStateKey( state );

		if ( ! allBreakpointStatesSnapshots[ currentBreakpointKey ] ) {
			allBreakpointStatesSnapshots[ currentBreakpointKey ] = {
				[ DEFAULT_STATE ]: buildStateSnapshotSlot(
					getStylesByMeta( { breakpoint: currentBreakpointId, state: null } ),
					parentBreakpoint,
					{},
					null
				),
			};
		}

		if ( state && ! allBreakpointStatesSnapshots[ currentBreakpointKey ][ stateKey ] ) {
			allBreakpointStatesSnapshots[ currentBreakpointKey ][ stateKey ] = buildStateSnapshotSlot(
				getStylesByMeta( { breakpoint: currentBreakpointId, state } ),
				parentBreakpoint,
				allBreakpointStatesSnapshots[ currentBreakpointKey ],
				state
			);
		}
	};

	return ( meta: StyleInheritanceMetaProps ) => {
		const { breakpoint, state } = meta;

		const stateKey = getStateKey( state );
		const breakpointKey = getBreakpointKey( breakpoint );

		if ( allBreakpointStatesSnapshots[ breakpointKey ]?.[ stateKey ] ) {
			// snapshot was already made for this breakpoint+state
			return allBreakpointStatesSnapshots[ breakpointKey ][ stateKey ].snapshot;
		}

		const breakpointsChain = [ ...breakpointsInheritancePaths[ breakpointKey ], breakpoint ];

		breakpointsChain.forEach( ( breakpointId, index ) => {
			const parentBreakpointId = index > 0 ? breakpointsChain[ index - 1 ] : null;

			buildMissingSnapshotsForBreakpoint(
				breakpointId,
				parentBreakpointId ? allBreakpointStatesSnapshots[ parentBreakpointId ] : undefined,
				state
			);
		} );

		return allBreakpointStatesSnapshots[ breakpointKey ]?.[ stateKey ]?.snapshot;
	};
}

/**
 * builds a mapping of each breakpoint to its inheritance chain, e.g. -
 * 	desktop: [],
 * 	tablet: [ 'desktop' ],
 * 	mobile: [ 'desktop', 'tablet' ]
 * @param root
 */
function makeBreakpointsInheritancePaths( root: BreakpointNode ): BreakpointsInheritancePath {
	const breakpoints: Partial< BreakpointsInheritancePath > = {};

	const traverse = ( node: BreakpointNode, parent?: BreakpointId[] ) => {
		const { id, children } = node;

		breakpoints[ id ] = parent ? [ ...parent ] : [];

		children?.forEach( ( child ) => {
			traverse( child, [ ...( breakpoints[ id ] ?? [] ), id ] );
		} );
	};

	traverse( root );

	return breakpoints as BreakpointsInheritancePath;
}

// creates a snapshot slot for a specific breakpoint and state
function buildStateSnapshotSlot(
	styles: StyleVariantDetails[],
	parentBreakpoint: BreakpointStatesSlotsMapping | undefined,
	currentBreakpoint: BreakpointStatesSlotsMapping,
	state: StyleDefinitionState
): StylesInheritanceSnapshotsSlot {
	const initialSlot = buildInitialSnapshotFromStyles( styles );

	if ( ! state ) {
		return {
			snapshot: mergeSnapshots( [ initialSlot.snapshot, parentBreakpoint?.[ DEFAULT_STATE ]?.snapshot ] ),
			stateSpecificSnapshot: undefined,
		};
	}

	return {
		snapshot: mergeSnapshots( [
			initialSlot.snapshot,
			parentBreakpoint?.[ state ]?.stateSpecificSnapshot,
			currentBreakpoint[ DEFAULT_STATE ]?.snapshot,
		] ),
		stateSpecificSnapshot: mergeSnapshots( [
			initialSlot.stateSpecificSnapshot,
			parentBreakpoint?.[ state ]?.stateSpecificSnapshot,
		] ),
	};
}

// creates an initial snapshot based on the passed style variants only
function buildInitialSnapshotFromStyles( styles: StyleVariantDetails[] ): StylesInheritanceSnapshotsSlot {
	const snapshot: StylesInheritanceSnapshot = {};

	styles.forEach( ( styleData ) => {
		const {
			variant: { props },
		} = styleData;

		Object.entries( props ).forEach( ( [ key, value ] ) => {
			const filteredValue = filterEmptyValues( value );

			if ( filteredValue === null ) {
				return;
			}

			if ( ! snapshot[ key ] ) {
				snapshot[ key ] = [];
			}

			const snapshotPropValue: SnapshotPropValue = {
				...styleData,
				value: filteredValue,
			};

			snapshot[ key ].push( snapshotPropValue );
		} );
	} );

	return {
		snapshot,
		stateSpecificSnapshot: snapshot,
	};
}

// merge previous snapshot into the current one - first value of each prop is the strongest
function mergeSnapshots( snapshots: ( StylesInheritanceSnapshot | undefined )[] ) {
	const snapshot: StylesInheritanceSnapshot = {};

	snapshots.filter( Boolean ).forEach( ( currentSnapshot ) =>
		Object.entries( currentSnapshot as StylesInheritanceSnapshot ).forEach( ( [ key, values ] ) => {
			if ( ! snapshot[ key ] ) {
				snapshot[ key ] = [];
			}

			// concatenate the previous snapshot's prop values to the current ones
			snapshot[ key ] = snapshot[ key ].concat( values );
		} )
	);

	return snapshot;
}
