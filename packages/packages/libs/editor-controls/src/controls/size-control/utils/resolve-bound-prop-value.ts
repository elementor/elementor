import { sizePropTypeUtil, type SizePropValue } from '@elementor/editor-props';

type SizeValue = SizePropValue[ 'value' ] | null;

export type ResolvedBoundProp = {
	sizeValue: SizeValue;
	placeholder: string | undefined;
};

export const resolveBoundPropValue = < T extends SizeValue >(
	value?: T | null,
	boundPropPlaceholder?: T | null,
	propPlaceholder?: string
): ResolvedBoundProp => {
	let sizeValue: T | null = null;

	if ( validateSizeValue( value ) ) {
		sizeValue = value;
	} else if ( validateSizeValue( boundPropPlaceholder ) ) {
		sizeValue = { size: '', unit: boundPropPlaceholder?.unit } as T;
	}

	return {
		sizeValue,
		placeholder: resolvePlaceholder( propPlaceholder, boundPropPlaceholder ),
	};
};

const validateSizeValue = ( value?: SizeValue | null ): value is SizeValue => {
	if ( ! value ) {
		return false;
	}

	const sizePropValue = sizePropTypeUtil.create( value );

	return sizePropTypeUtil.isValid( sizePropValue );
};

const resolvePlaceholder = ( propPlaceholder?: string, boundPropPlaceholder?: SizeValue ): string | undefined => {
	if ( propPlaceholder ) {
		return propPlaceholder;
	}

	const size = boundPropPlaceholder?.size;

	if ( size === undefined ) {
		return undefined;
	}

	if ( typeof size === 'number' ) {
		return size.toString();
	}

	return size;
};
