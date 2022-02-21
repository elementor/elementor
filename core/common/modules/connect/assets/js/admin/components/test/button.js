const Button = ( { onClick } ) => {
	return (
		<button className="e-button e-button e-button--cta" onClick={ onClick }>
			{ __( 'Test connection' ) }
		</button>
	);
};

export { Button };
export default Button;

Button.propTypes = {
	onClick: PropTypes.func,
};
