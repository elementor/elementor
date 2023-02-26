import React, { useContext } from 'react';
import styled from "styled-components";
import { ActiveElementContext } from "../app";

const ElementWrapper = ( props ) => {
	const activeElementContext = useContext( ActiveElementContext );
	const setActive = activeElementContext.setActive;

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
        background-color: #F1F2F3;
      }

      &:hover:not(.active) {
        cursor: pointer;
        border: 1px solid #D5DADF;
        border-radius: 3px;
        margin: -1px;
        background-color: #F9FAFA;
      }
	`;

	return (
		<Wrapper { ...props } className={ props.isActive ? 'active' : '' }
		         onClick={ () => setActive( props.isActive ? null : props.id, props.source ) }>{ props.children }</Wrapper>
	);
};

export default ElementWrapper;