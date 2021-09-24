import { forwardRef } from 'react';
import styled from 'styled-components';
import { getVariant } from 're-styled/utils';
import style from 'e-styles/text';

const Text = styled.p`
	${ ( props ) => getVariant( props, style, props.variant ) }
`;

export const StyledText = forwardRef( ( props, ref ) => (
	<Text { ...props } as={ props.tag } ref={ ref }>{ props.children }</Text>
) );

StyledText.displayName = 'StyledText';

StyledText.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any,
	tag: PropTypes.oneOf( [ 'xxs', 'xs', 'sm', 'md', 'lg', 'xl' ] ),
};

StyledText.defaultProps = {
	className: '',
};
