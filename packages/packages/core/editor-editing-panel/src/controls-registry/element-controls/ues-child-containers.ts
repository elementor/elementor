import { getContainer, type V1Element } from '@elementor/editor-elements';

import { useElementsField } from '../elements-field';

export function useChildContainers< T extends Record< string, string > >( containerTypes: T ) {
	const { element, childElements } = useElementsField();
	const container = getContainer( element.id );

	const childContainers = Object.entries( containerTypes ).reduce(
		( acc, [ containerName, childType ] ) => {
			const childElement = childElements.find( ( child ) => child.type === childType );

			const containerElement = container?.children?.findRecursive?.(
				( child ) => child.model.get( 'elType' ) === childElement?.target_container_selector
			);

			if ( ! containerElement ) {
				return { ...acc, [ containerName ]: null };
			}

			return { ...acc, [ containerName ]: containerElement };
		},
		{} as Record< keyof T, V1Element >
	);

	return childContainers;
}
