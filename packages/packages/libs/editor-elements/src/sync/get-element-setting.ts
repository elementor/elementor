import {
	type ArrayPropType,
	type Dependency,
	type DependencyTerm,
	type ObjectPropType,
	type PropsSchema,
	type PropType,
	type UnionPropType,
} from '@elementor/editor-props';
import { createError } from '@elementor/utils';

import { type ElementID } from '../types';
import { getContainer } from './get-container';

const CircularDependenciesError = createError( {
	code: 'circular_prop_dependencies_detected',
	message: 'Circular prop dependencies detected',
} );

export const getElementSetting = < TValue >( elementId: ElementID, settingKey: string ): TValue | null => {
	const container = getContainer( elementId );

	return ( container?.settings?.get( settingKey ) as TValue ) ?? null;
};

export const getElementSettings = < TValue >(
	elementId: ElementID,
	settingKey: string[]
): Record< string, TValue | null > => {
	return Object.fromEntries( settingKey.map( ( key ) => [ key, getElementSetting( elementId, key ) ] ) );
};

export const extractDependingOnSelf = ( schema: PropsSchema ): Record< string, string[] > => {
	if ( ! schema || typeof schema !== 'object' ) {
		return {};
	}

	const dependencyGraph = Object.entries( schema ).reduce(
		( graph, [ propName, propType ] ) => processPropType( propName, propType, [], graph ),
		{} as Record< string, string[] >
	);

	ensureNoCircularDependencies( dependencyGraph );

	return dependencyGraph;
};

const detectCircularDependencies = (
	propPath: string,
	dependencyGraph: Record< string, string[] >,
	visited: Set< string >,
	recursionStack: Set< string >
): void => {
	if ( recursionStack.has( propPath ) ) {
		throw new CircularDependenciesError();
	}

	if ( visited.has( propPath ) ) {
		return;
	}

	visited.add( propPath );
	recursionStack.add( propPath );

	const dependencies = dependencyGraph[ propPath ] || [];
	for ( const dependency of dependencies ) {
		detectCircularDependencies( dependency, dependencyGraph, visited, recursionStack );
	}

	recursionStack.delete( propPath );
};

const ensureNoCircularDependencies = ( dependencyGraph: Record< string, string[] > ): void => {
	const visited = new Set< string >();
	const recursionStack = new Set< string >();

	for ( const propPath of Object.keys( dependencyGraph ) ) {
		if ( ! visited.has( propPath ) ) {
			detectCircularDependencies( propPath, dependencyGraph, visited, recursionStack );
		}
	}
};

const processDependencyTerms = (
	terms: ( DependencyTerm | Dependency )[],
	sourcePath: string,
	dependencyGraph: Record< string, string[] >
): Record< string, string[] > => {
	return terms.reduce( ( graph, term ) => {
		if ( isTermDependency( term ) ) {
			return processDependencyTerms( term.terms, sourcePath, graph );
		}
		const targetPath = term.path.join( '.' );
		const existingDependencies = graph[ targetPath ] || [];

		if ( ! existingDependencies.includes( sourcePath ) ) {
			return {
				...graph,
				[ targetPath ]: [ ...existingDependencies, sourcePath ],
			};
		}

		return graph;
	}, dependencyGraph );
};

const processPropType = (
	propName: string,
	propType: PropType,
	currentPath: string[],
	dependencyGraph: Record< string, string[] >
): Record< string, string[] > => {
	if ( ! hasDependencies( propType ) ) {
		return dependencyGraph;
	}

	const fullPath = [ ...currentPath, propName ];
	const sourcePath = fullPath.join( '.' );

	const graphWithDependencies = processDependencyTerms(
		propType.dependencies?.terms ?? [],
		sourcePath,
		dependencyGraph
	);

	if ( isObjectPropType( propType ) ) {
		return Object.entries( propType.shape ).reduce(
			( graph, [ nestedPropName, nestedPropType ] ) =>
				processPropType( nestedPropName, nestedPropType, fullPath, graph ),
			graphWithDependencies
		);
	}

	if ( isArrayPropType( propType ) ) {
		return processPropType( propName, propType.item_prop_type, currentPath, graphWithDependencies );
	}

	if ( isUnionPropType( propType ) ) {
		return Object.entries( propType.prop_types ).reduce(
			( graph, [ unionPropName, unionPropType ] ) =>
				processPropType( unionPropName, unionPropType, fullPath, graph ),
			graphWithDependencies
		);
	}

	return graphWithDependencies;
};

const isObjectPropType = ( propType: PropType ): propType is ObjectPropType => {
	return propType.kind === 'object' && 'shape' in propType && !! propType.shape;
};

const isArrayPropType = ( propType: PropType ): propType is ArrayPropType => {
	return propType.kind === 'array' && 'item_prop_type' in propType && !! propType.item_prop_type;
};

const isUnionPropType = ( propType: PropType ): propType is UnionPropType => {
	return propType.kind === 'union' && 'prop_types' in propType && !! propType.prop_types;
};

const hasDependencies = ( propType: PropType ): boolean => {
	return !! propType.dependencies?.terms.length;
};

const isTermDependency = ( term: DependencyTerm | Dependency ): term is Dependency => {
	return 'relation' in term;
};
