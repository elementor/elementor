import { getElementType } from '@elementor/editor-elements';
import { htmlPropTypeUtil, stringPropTypeUtil, type TransformablePropValue } from '@elementor/editor-props';

import { getBlockedValue, getInlineEditablePropertyName } from '../utils/inline-editing-utils';
import { type ElementView, type LegacyWindow } from './types';

const WIDGET_PROPERTY_MAP: Record< string, string > = {
	'e-heading': 'title',
	'e-paragraph': 'paragraph',
};

const legacyWindow = window as unknown as LegacyWindow;

const getWidgetType = ( view: ElementView ) => {
	return view.container?.model?.get( 'widgetType' ) ?? view.container?.model?.get( 'elType' ) ?? null;
};

const getExpectedTag = ( view: ElementView ): string | null => {
	const widgetType = getWidgetType( view );

	if ( ! widgetType ) {
		return null;
	}

	const propsSchema = getElementType( widgetType )?.propsSchema;

	if ( ! propsSchema?.tag ) {
		return null;
	}

	const tagValue = view.model.get( 'settings' )?.get( 'tag' ) as TransformablePropValue< string >;

	return (
		stringPropTypeUtil.extract( tagValue ?? null ) ??
		stringPropTypeUtil.extract( propsSchema.tag.default ?? null ) ??
		null
	);
};

const getToolbarOffset = () => {
	const positionFallback = { left: 0, top: 0 };

	const iFrameElement = legacyWindow?.elementor?.$preview?.get( 0 );
	const iFramePosition = iFrameElement?.getBoundingClientRect() ?? positionFallback;

	const previewElement = legacyWindow?.elementor?.$previewWrapper?.get( 0 );
	const previewPosition = previewElement
		? { left: previewElement.scrollLeft, top: previewElement.scrollTop }
		: positionFallback;

	return {
		left: iFramePosition.left + previewPosition.left,
		top: iFramePosition.top + previewPosition.top,
	};
};

const getClasses = ( view: ElementView ): string => {
	return ( view.el?.children?.[ 0 ]?.classList.toString() ?? '' ) + ' strip-styles';
};

const isValueDynamic = ( view: ElementView ): boolean => {
	const widgetType = getWidgetType( view );
	const settingKey = WIDGET_PROPERTY_MAP[ widgetType ?? '' ] ?? '';

	if ( ! settingKey ) {
		return false;
	}

	const propValue = view.model.get( 'settings' )?.get( settingKey ) as TransformablePropValue< string >;

	return propValue?.$$type === 'dynamic';
};

const getContentValue = ( view: ElementView ): string => {
	const settingKey = getInlineEditablePropertyName( view.container );
	return htmlPropTypeUtil.extract( view.model.get( 'settings' )?.get( settingKey ) ?? null ) ?? '';
};

const setContentValue = ( view: ElementView, value: string | null ) => {
	const settingKey = getInlineEditablePropertyName( view.container );
	const valueToSave = value ? htmlPropTypeUtil.create( value ) : null;
	view.model.get( 'settings' )?.set( settingKey, valueToSave );
};

const ensureProperValue = ( view: ElementView ) => {
	const actualValue = getContentValue( view );
	const tagSettings = getExpectedTag( view );
	const wrappedValue = getBlockedValue( actualValue, tagSettings );

	if ( actualValue !== wrappedValue ) {
		setContentValue( view, wrappedValue );
	}
};

export const inlineEditingBridgeConfig = {
	type: 'inline-editing' as const,
	shouldActivate: ( view: ElementView ) => ! isValueDynamic( view ),
	activationTrigger: 'dblclick' as const,
	onActivate: ( view: ElementView ) => {
		ensureProperValue( view );
	},
	getProps: ( view: ElementView ) => ( {
		classes: getClasses( view ),
		expectedTag: getExpectedTag( view ),
		toolbarOffset: getToolbarOffset(),
		onComplete: () => view.render(),
	} ),
};

