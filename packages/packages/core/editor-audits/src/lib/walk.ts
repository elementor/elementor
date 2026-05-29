import { type ElementSnapshotNode } from '../types';

export type WalkVisitor = ( node: ElementSnapshotNode, parents: ElementSnapshotNode[] ) => void;

export function walkElements( tree: ElementSnapshotNode[], visit: WalkVisitor ): void {
	recurse( tree, [], visit );
}

function recurse( nodes: ElementSnapshotNode[], parents: ElementSnapshotNode[], visit: WalkVisitor ): void {
	for ( const node of nodes ) {
		visit( node, parents );
		recurse( node.elements, [ ...parents, node ], visit );
	}
}
