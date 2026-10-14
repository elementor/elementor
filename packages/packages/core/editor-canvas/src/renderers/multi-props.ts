import { type Props, type PropValue } from '@elementor/editor-props';

type MultiProps = {
	'$$multi-props': true;
	value: Props;
};

export const isMultiProps = ( propValue: PropValue ): propValue is MultiProps => {
	return (
		!! propValue &&
		typeof propValue === 'object' &&
		'$$multi-props' in propValue &&
		propValue[ '$$multi-props' ] === true
	);
};

export const createMultiPropsValue = ( props: Props ): MultiProps => {
	return {
		'$$multi-props': true,
		value: props,
	};
};

export const getMultiPropsValue = ( multiProps: MultiProps ): Props => {
	return multiProps.value;
};
