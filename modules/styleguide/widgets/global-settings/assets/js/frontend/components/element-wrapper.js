import React from 'react';
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  padding: 12px;

  &.active {
    cursor: pointer;
    border: 1px solid #424344;
    border-radius: 3px;
    margin: -1px;
  }

  &:hover:not(.active) {
    cursor: pointer;
    border: 1px solid #D5DADF;
    border-radius: 3px;
    margin: -1px;
  }
`;

const ElementWrapper = React.forwardRef( ( props, ref ) => {
	const { isActive, children } = props;

	const classes = [ 'elementor-ignore-background-click' ];

	if ( isActive ) {
		classes.push( 'active' );
	}

	return (
		<Wrapper { ...props }
		         ref={ ref }
		         className={ classes.join( ' ' ) }
		>{ children }</Wrapper>
	);
} );

export default ElementWrapper;