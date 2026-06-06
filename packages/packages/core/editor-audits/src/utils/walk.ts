import { type ElementSnapshotNode } from '../types';

export type WalkVisitor = ( node: ElementSnapshotNode, parents: readonly ElementSnapshotNode[] ) => void;

export function walkElements( tree: ElementSnapshotNode[], visit: WalkVisitor ): void {
	const parents: ElementSnapshotNode[] = [];
	recurse( tree, parents, visit );
}

function recurse( nodes: ElementSnapshotNode[], parents: ElementSnapshotNode[], visit: WalkVisitor ): void {
	for ( const node of nodes ) {
		visit( node, parents );
		parents.push( node );
		recurse( node.elements, parents, visit );
		parents.pop();
	}
}
