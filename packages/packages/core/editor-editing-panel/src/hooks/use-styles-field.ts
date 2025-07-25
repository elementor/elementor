import type { PropKey, PropValue } from '@elementor/editor-props';

import { useStylesFields } from './use-styles-fields';

export function useStylesField< T extends PropValue >(
	propName: PropKey,
	meta: { history: { propDisplayName: string } }
): {
	value: T;
	setValue: ( newValue: T ) => void;
	canEdit?: boolean;
} {
	const { values, setValues, canEdit } = useStylesFields< { [ k: typeof propName ]: T } >( [ propName ] );

	const value = values?.[ propName ] ?? null;

	const setValue = ( newValue: T ) => {
		setValues( { [ propName ]: newValue }, meta );
	};

	return { value: value as T, setValue, canEdit };
}
