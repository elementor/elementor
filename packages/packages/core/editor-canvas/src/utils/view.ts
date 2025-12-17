import { getElementType } from '@elementor/editor-elements';
import {
	stringPropTypeUtil,
	type PropTypeUtil,
	type PropValue,
	type TransformablePropValue,
} from '@elementor/editor-props';

import { type ElementView, type LegacyWindow } from '../legacy/types';

const legacyWindow = window as unknown as LegacyWindow;

export const isValueDynamic = ( view: ElementView, settingKey: string ): boolean => {
	if ( ! settingKey ) {
		return false;
	}

	const propValue = view.model.get( 'settings' )?.get( settingKey ) as TransformablePropValue< string >;
	return propValue?.$$type === 'dynamic';
};

export const getViewTag = ( view: ElementView ): string | null => {
	const widgetType = view.container?.model?.get( 'widgetType' ) ?? view.container?.model?.get( 'elType' );
	const propsSchema = widgetType ? getElementType( widgetType )?.propsSchema : null;

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

export const getPreviewOffset = () => {
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

export const syncViewSetting = <TKey extends string, TValue extends PropValue>(
	view: ElementView,
	settingKey: string,
	propTypeUtil: PropTypeUtil<TKey, TValue>,
	transform?: ( value: TValue ) => TValue
) => {
	const currentValue = propTypeUtil.extract( view.model.get( 'settings' )?.get( settingKey ) ?? null );
	const transformedValue = transform && currentValue ? transform( currentValue ) : currentValue;

	if ( currentValue !== transformedValue && transformedValue !== null ) {
		view.model.get( 'settings' )?.set( settingKey, propTypeUtil.create( transformedValue ) );
	}
};

