import * as React from 'react';
import { deleteElementStyle, getElementSetting, updateElementSettings } from '@elementor/editor-elements';
import { classesPropTypeUtil, type ClassesPropValue } from '@elementor/editor-props';
import { type StyleDefinition } from '@elementor/editor-styles';
import { createLocation } from '@elementor/locations';
import { useSessionStorage } from '@elementor/session';

import { useClassesProp } from '../../contexts/classes-prop-context';
import { useElement } from '../../contexts/element-context';
import { useStyle } from '../../contexts/style-context';

export const { Slot: CssClassConvertSlot, inject: injectIntoCssClassConvert } = createLocation< {
	styleDef: StyleDefinition | null;
	successCallback: ( newId: string ) => void;
	canConvert: boolean;
} >();

type OwnProps = {
	styleDef: StyleDefinition | null;
	closeMenu: () => void;
	canConvert: boolean;
};

/**
 * Convert a local class to a global class injection point
 * @param props
 */
export const CssClassConvert = ( props: OwnProps ) => {
	const { element } = useElement();
	const elementId = element.id;
	const currentClassesProp = useClassesProp();
	const { setId: setActiveId } = useStyle();
	const [ , saveValue ] = useSessionStorage( 'last-converted-class-generated-name', 'app' );

	const successCallback = ( newId: string ) => {
		if ( ! props.styleDef ) {
			throw new Error( 'Style definition is required for converting local class to global class.' );
		}

		onConvert( {
			newId,
			elementId,
			classesProp: currentClassesProp,
			styleDef: props.styleDef,
		} );

		saveValue( newId );
		setActiveId( newId );
		props.closeMenu();
	};

	return (
		<CssClassConvertSlot
			canConvert={ !! props.canConvert }
			styleDef={ props.styleDef }
			successCallback={ successCallback }
		/>
	);
};

type OnConvertOptions = {
	newId: string;
	elementId: string;
	classesProp: string;
	styleDef: StyleDefinition;
};

const onConvert = ( opts: OnConvertOptions ) => {
	const { newId, elementId, classesProp } = opts;
	deleteElementStyle( elementId, opts.styleDef.id );
	const currentUsedClasses = getElementSetting< ClassesPropValue >( elementId, classesProp ) || { value: [] };
	updateElementSettings( {
		id: elementId,
		props: { [ classesProp ]: classesPropTypeUtil.create( [ newId, ...currentUsedClasses.value ] ) },
		withHistory: false,
	} );
};
