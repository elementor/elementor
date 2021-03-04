export const pxToRem = ( pixels ) => {
	return pixels
		.split( ' ' )
		.map( ( value ) => `${ value * 0.0625 }rem` )
		.join( ' ' );
};

export const arrayToClassName = ( array ) => {
	return array.filter( ( classItem ) => '' !== classItem ).join( ' ' );
};

export const isOneOf = ( filetype, filetypeOptions ) => {
	return filetypeOptions.some( ( type ) => filetype.includes( type ) );
};
