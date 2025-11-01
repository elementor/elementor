type Options = {
	tag: string;
	attrs?: Record< string, string >;
	dataset?: Record< string, string >;
	children?: HTMLElement[];
};

export function createDOMElement( { tag, attrs = {}, dataset = {}, children = [] }: Options ) {
	const el = globalThis.document.createElement( tag );

	Object.entries( attrs ).forEach( ( [ key, value ] ) => el.setAttribute( key, value ) );
	
	Object.entries( dataset ).forEach( ( [ key, value ] ) => el.dataset[ key ] = value );

	children.forEach( ( child ) => el.appendChild( child ) );

	return el;
}
