import { type V1ElementData } from '@elementor/editor-elements';
import { hashString } from '@elementor/utils';

const ELEMENT_ID_LENGTH = 7;
// The purpose of this function is to solve the issue of component inner elements having the same ID
// when there are multiple instances of the same component on a page.
// We change the ID of the inner elements to a hash of the nesting path of the element and the element's originalID.
export function formatComponentElementsId( elements: V1ElementData[], path: string[] ): V1ElementData[] {
	return elements.map( ( element ) => {
		const nestingPath = [ ...path, element.id ];
		const id = hashString( nestingPath.join( '_' ), ELEMENT_ID_LENGTH );

		return {
			...element,
			id,
			originId: element.id,
			elements: element.elements ? formatComponentElementsId( element.elements, nestingPath ) : undefined,
		};
	} );
}
