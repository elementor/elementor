type Options = {
	tag: string;
	attrs?: Record< string, string >;
	children?: HTMLElement[];
};

export function createDOMElement( { tag, attrs = {}, children = [] }: Options ) {
	const el = globalThis.document.createElement( tag );

	Object.entries( attrs ).forEach( ( [ key, value ] ) => el.setAttribute( key, value ) );

	children.forEach( ( child ) => el.appendChild( child ) );

	return el;
}
