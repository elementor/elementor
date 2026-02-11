import { type V1ElementData } from '@elementor/editor-elements';

export function prefixElementIds( elements: V1ElementData[], prefix: string ): V1ElementData[] {
	return elements.map( ( element ) => ( {
		...element,
		id: `${ prefix }_${ element.id }`,
		originId: element.id,
		elements: element.elements ? prefixElementIds( element.elements, prefix ) : undefined,
	} ) );
}
