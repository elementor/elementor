import React, { useContext, useEffect, useRef } from 'react';
import styled from "styled-components";
import { AnchorContext } from "../providers/anchor-provider";

const AreaTitle = ( props ) => {

	const anchorContext = useContext( AnchorContext );
	const ref = useRef( null );

	useEffect( () => {
		anchorContext.registerAnchor( props.name, ref );
	}, [ ref ] );

	const Title = styled.h2`
      color: #515962;
      font-family: Roboto, sans-serif;
      font-size: 30px;
      font-weight: 400;
      text-transform: capitalize;
      font-style: normal;
      text-decoration: none;
      line-height: 1.5em;
      letter-spacing: 0;
      word-spacing: 0;
      text-align: center;
	  padding: 15px 0 0 0;
	`;

	return (
		<Title { ...props } ref={ ref }>
			{ props.children }
        </Title>
	);
};

export default AreaTitle;