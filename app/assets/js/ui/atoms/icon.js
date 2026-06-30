import { forwardRef } from 'react';

const Icon = forwardRef( ( props, ref ) => {
	const { className, ...rest } = props;
	return (
		<i ref={ ref } className={ `eps-icon ${ className }` } { ...rest } />
	);
} );

Icon.propTypes = {
	className: PropTypes.string.isRequired,
};

Icon.defaultProps = {
	className: '',
};

export default Icon;
