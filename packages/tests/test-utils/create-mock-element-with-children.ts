import { type V1Element, type V1ElementModelProps, type V1ElementSettingsProps } from '@elementor/editor-elements';

type V1Model< T > = {
	get: < K extends keyof T >( key: K ) => T[ K ];
	set: < K extends keyof T >( key: K, value: T[ K ] ) => void;
	toJSON: () => T;
};

function createMockModel< T >( data: T ): V1Model< T > {
	return {
		get: < K extends keyof T >( key: K ): T[ K ] => data[ key ],
		set: < K extends keyof T >( key: K, value: T[ K ] ): void => {
			data[ key ] = value;
		},
		toJSON: (): T => data,
	};
}

export function createMockChild( modelData: V1ElementModelProps ): V1Element {
	return {
		id: modelData.id,
		model: createMockModel( modelData ),
		settings: createMockModel< V1ElementSettingsProps >( {} ),
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

export function createMockContainer( id: string, children: V1Element[], elType = 'container' ): V1Element {
	const modelData: V1ElementModelProps = {
		elType,
		id,
	};

	return {
		id,
		model: createMockModel( modelData ),
		settings: createMockModel< V1ElementSettingsProps >( {} ),
		children: createMockChildren( children ),
	};
}
