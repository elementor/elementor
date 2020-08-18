import Text from 'elementor-app/ui/atoms/text';

export default function DialogText( props ) {
	return (
		<Text className="eps-dialog__text" variant="xs" {...props} />
	);
}

DialogText.propTypes = {
	...Text.propTypes,
};

DialogText.defaultProps = {
	...Text.defaultProps,
	tag: 'p',
	variant: 'sm',
};
