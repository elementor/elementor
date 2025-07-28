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
	styleDef: StyleDefinition;
	successCallback: ( newId: string ) => void;
} >();

type OwnProps = {
	styleDef: StyleDefinition;
	closeMenu: () => void;
};

/**
 * Promote a local class to a global class injection point
 * @param props
 */
export const CssClassConvert = ( props: OwnProps ) => {
	const { element } = useElement();
	const elementId = element.id;
	const currentClassesProp = useClassesProp();
	const { setId: setActiveId } = useStyle();
	const [ , saveValue ] = useSessionStorage( `last-converted-class-generated-name` );

	const successCallback = ( newId: string ) => {
		onPromoteSuccess( {
			newId,
			elementId,
			classesProp: currentClassesProp,
			styleDef: props.styleDef,
		} );
		saveValue( newId );
		setActiveId( newId );
		props.closeMenu();
	};

	return <CssClassConvertSlot styleDef={ props.styleDef } successCallback={ successCallback } />;
};

type OnPromoteSuccessOpts = {
	newId: string;
	elementId: string;
	classesProp: string;
	styleDef: StyleDefinition;
};
const onPromoteSuccess = ( opts: OnPromoteSuccessOpts ) => {
	const { newId, elementId, classesProp } = opts;
	deleteElementStyle( elementId, opts.styleDef.id );
	const currentUsedClasses = getElementSetting< ClassesPropValue >( elementId, classesProp ) || { value: [] };
	updateElementSettings( {
		id: elementId,
		props: { [ classesProp ]: classesPropTypeUtil.create( [ newId, ...currentUsedClasses.value ] ) },
		withHistory: false,
	} );
};
