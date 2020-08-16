import Text from 'elementor-app/ui/atoms/text';

export default function DialogText( props ) {
	return (
		<Text {...props} />
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
