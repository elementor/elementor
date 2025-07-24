import * as React from 'react';
import { createLocation } from '@elementor/locations';
import { useStyle } from '../../contexts/style-context';
import { deleteElementStyle, getElementSetting, updateElementSettings } from '@elementor/editor-elements';
import { useClassesProp } from '../../contexts/classes-prop-context';
import { classesPropTypeUtil, ClassesPropValue } from '@elementor/editor-props';
import { StyleDefinition } from '@elementor/editor-styles';
import { useElement } from '../../contexts/element-context';

export const { Slot: CssClassPromoteSlot, inject: injectIntoCssClassPromote } = createLocation<any>();

type OwnProps = {
	styleDef: StyleDefinition;
}

/**
 * Promote a local class to a global class injection point
 * @component
 */
export const CssClassPromote = (props: OwnProps) => {
	const { element } = useElement();
	const elementId = element.id;
	const currentClassesProp = useClassesProp();
	const { setId: setActiveId } = useStyle();

	const successCallback = (newId: string) => {
		onPromoteSuccess({
			newId,
			elementId,
			classesProp: currentClassesProp,
			styleDef: props.styleDef,
		});
		setActiveId(newId);
	}

	return <CssClassPromoteSlot styleDef={props.styleDef} successCallback={successCallback} />;
}

type OnPromoteSuccessOpts = {
	newId: string;
	elementId: string;
	classesProp: string;
	styleDef: StyleDefinition;
};
const onPromoteSuccess = (opts: OnPromoteSuccessOpts) => {
	const { newId, elementId, classesProp } = opts;
	deleteElementStyle(elementId, opts.styleDef.id);
	const currentUsedClasses = getElementSetting<ClassesPropValue>(elementId, classesProp) || { value: [] };
	updateElementSettings({
		id: elementId,
		props: { [classesProp]: classesPropTypeUtil.create([newId, ...currentUsedClasses.value]) },
		withHistory: false,
	});
}