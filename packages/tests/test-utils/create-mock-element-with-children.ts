import { type V1Element, type V1ElementModelProps, type V1ElementSettingsProps } from '@elementor/editor-elements';

type V1Model = V1Element[ 'model' ];
type V1Settings = V1Element[ 'settings' ];

type ModelData = V1ElementModelProps & { elements?: V1Model[] };

function createMockModel( data: ModelData ): V1Model {
	return {
		get: ( key: string ) => data[ key as keyof ModelData ],
		set: ( key: string, value: unknown ) => {
			( data as Record< string, unknown > )[ key ] = value;
		},
		toJSON: () => data,
	} as V1Model;
}

function createMockSettings( data: V1ElementSettingsProps = {} ): V1Settings {
	return {
		get: ( key: string ) => data[ key as keyof V1ElementSettingsProps ],
		set: ( key: string, value: unknown ) => {
			( data as Record< string, unknown > )[ key ] = value;
		},
		toJSON: () => data,
	} as V1Settings;
}

export function createMockChild( modelData: V1ElementModelProps ): V1Element {
	return {
		id: modelData.id,
		model: createMockModel( modelData ),
		settings: createMockSettings(),
	};
}

function createMockChildren( children: V1Element[] ): V1Element[ 'children' ] {
	const mockChildren = [ ...children ] as NonNullable< V1Element[ 'children' ] >;

	mockChildren.forEachRecursive = ( callback: ( child: V1Element ) => void ): V1Element[] => {
		const processChild = ( child: V1Element ) => {
			callback( child );
			if ( child.children && child.children.length > 0 ) {
				child.children.forEach( processChild );
			}
		};

		children.forEach( processChild );
		return children;
	};

	mockChildren.findRecursive = ( predicate: ( child: V1Element ) => boolean ): V1Element | undefined => {
		for ( const child of children ) {
			if ( predicate( child ) ) {
				return child;
			}
			if ( child.children ) {
				const found = child.children.findRecursive?.( predicate );
				if ( found ) {
					return found;
				}
			}
		}
		return undefined;
	};

	return mockChildren;
}

export function createMockContainer( id: string, children: V1Element[] = [], elType = 'container' ): V1Element {
	const childModels = children.map( ( child ) => child.model );

	const modelData: ModelData = {
		elType,
		id,
		elements: childModels,
	};

	return {
		id,
		model: createMockModel( modelData ),
		settings: createMockSettings(),
		children: createMockChildren( children ),
	};
}
