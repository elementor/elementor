import { forwardRef } from 'react';
import { Styled } from 'e-components';

const StyledUI = forwardRef( ( props, ref ) => {
	return (
		<Styled
			{ ...props }
			ref={ ref }
			cacheGroup="ui"
			cacheKey={ props.cacheKey || props.displayName }
		>
			{ props.children }
		</Styled>
	);
} );

StyledUI.displayName = 'StyledUI';

StyledUI.propTypes = {
	cacheKey: PropTypes.string.isRequired,
	className: PropTypes.string,
	children: PropTypes.any,
	displayName: PropTypes.string,
	styleProps: PropTypes.oneOfType( [ PropTypes.object, PropTypes.array ] ),
};

StyledUI.defaultProps = {
	className: '',
};

export default StyledUI;
