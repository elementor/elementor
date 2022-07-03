export class ElementTypeNotFound extends Error {
	constructor( elementType ) {
		super( `Element type not found: '${ elementType }'` );
	}
}

export default ElementTypeNotFound;
