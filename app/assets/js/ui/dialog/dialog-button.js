import Button from 'elementor-app/ui/molecules/button';

export default function DialogButton( props ) {
	return (
		<Button
			{ ...props }
			className={ `eps-dialog__button ${ props.className }` }
		/>
	);
}

DialogButton.propTypes = {
	...Button.propTypes,
	tabIndex: PropTypes.string,
	type: PropTypes.string,
};

DialogButton.defaultProps = {
	...Button.defaultProps,
	tabIndex: '0',
	type: 'button',
};
