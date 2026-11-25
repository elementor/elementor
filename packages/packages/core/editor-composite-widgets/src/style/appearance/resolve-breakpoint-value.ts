import { type Props } from '@elementor/editor-props';
import { type BreakpointId, type BreakpointNode } from '@elementor/editor-responsive';
import { type StyleDefinitionVariant } from '@elementor/editor-styles';

export type PropsByBreakpoint = Partial< Record< string, Props > >;

export const DESKTOP_BREAKPOINT: BreakpointId = 'desktop';

export function getBreakpointPath( tree: BreakpointNode, breakpoint: BreakpointId ): BreakpointId[] {
	if ( tree.id === breakpoint ) {
		return [ tree.id ];
	}

	for ( const child of tree.children ) {
		const path = getBreakpointPath( child, breakpoint );

		if ( path.length ) {
			return [ tree.id, ...path ];
		}
	}

	return [];
}

export function getDescendantBreakpoints( tree: BreakpointNode, breakpoint: BreakpointId ): BreakpointId[] {
	const node = findBreakpointNode( tree, breakpoint );

	return node
		? node.children.flatMap( ( child ) => [ child.id, ...getDescendantBreakpoints( child, child.id ) ] )
		: [];
}

export function resolvePropsAtPath( propsByBreakpoint: PropsByBreakpoint, path: BreakpointId[] ): Props {
	return path.reduce< Props >( ( resolved, breakpoint ) => {
		Object.entries( propsByBreakpoint[ breakpoint ] ?? {} ).forEach( ( [ key, value ] ) => {
			if ( value !== null && value !== undefined ) {
				resolved[ key ] = value;
			}
		} );

		return resolved;
	}, {} );
}

export function getNormalStatePropsByBreakpoint( variants: StyleDefinitionVariant[] ): PropsByBreakpoint {
	return variants
		.filter( ( { meta } ) => meta.state === null )
		.reduce< PropsByBreakpoint >( ( byBreakpoint, { meta, props } ) => {
			byBreakpoint[ meta.breakpoint ?? DESKTOP_BREAKPOINT ] = props;

			return byBreakpoint;
		}, {} );
}

function findBreakpointNode( tree: BreakpointNode, breakpoint: BreakpointId ): BreakpointNode | null {
	if ( tree.id === breakpoint ) {
		return tree;
	}

	for ( const child of tree.children ) {
		const node = findBreakpointNode( child, breakpoint );

		if ( node ) {
			return node;
		}
	}

	return null;
}
