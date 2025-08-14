import { type Variable } from '../../types';

export const resolveCssVariable = ( id: string, variable: Variable ) => {
	let name = id;
	// let fallbackValue = '';
	//
	// if ( variable ) {
	// 	fallbackValue = transformValue( variable );
	// }
	//
	if ( variable && ! variable.deleted ) {
		name = variable.label;
	}
	//
	if ( ! name.trim() ) {
		return null;
	}

	// if ( ! fallbackValue.trim() ) {
	return `var(--${ name })`;
	// }

	// return `var(--${ name }, ${ fallbackValue })`;
};
