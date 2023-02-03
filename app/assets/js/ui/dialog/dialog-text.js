import Text from 'elementor-app/ui/atoms/text';

export default function DialogText( props ) {
	return (
		<Text variant="xs" { ...props } className={ `eps-dialog__text ${ props.className }` } />
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
