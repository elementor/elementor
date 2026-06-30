export function kebabToCamelCase( kebabCase: string ) {
	return kebabCase.replace( /-(\w)/g, ( _, w: string ) => w.toUpperCase() );
}
