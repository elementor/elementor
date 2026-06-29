import { type TVariable } from '../../storage';

export const resolveCssVariable = ( id: string, variable: TVariable ) => {
	let name = id;
	let fallbackValue = '';

	if ( variable ) {
		fallbackValue = variable.value;
	}

	if ( variable && ! variable.deleted ) {
		name = variable.label;
	}

	if ( ! name.trim() ) {
		return null;
	}

	const validCssVariableName = `--${ name }`;

	if ( ! fallbackValue.trim() ) {
		return `var(${ validCssVariableName })`;
	}

	return `var(${ validCssVariableName }, ${ fallbackValue })`;
};
