import React, { useContext } from 'react';
import styled from "styled-components";
import { ActiveElementContext } from "../app";
import ElementTitle from "./element-title";
import ElementWrapper from "./element-wrapper";

/**
 *
 * @param color { _id, title, color, isActive}
 * @return {JSX.Element}
 * @constructor
 */
const Color = ( { color, width } ) => {

	const Content = styled.div`
      background-color: ${ color.color };
      padding: 74px 1px 7px 10px;
      border-style: solid;
      border-width: 1px 1px 1px 1px;
      border-color: #D5DADF;
      border-radius: 3px 3px 3px 3px;
	`;

	const HexString = styled.p`
      width: ${ width };
      margin: 0;
      color: #FFFFFF;
      font-family: "Roboto", Sans-serif;
      height: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      font-style: normal;
      text-decoration: none;
      line-height: 1.1em;
      letter-spacing: 0px;
      word-spacing: 0px;
	`;

	return (
		<ElementWrapper isActive={color.isActive} id={color._id} source='colors'>
			<ElementTitle>{ color.title }</ElementTitle>
			<Content>
				<HexString>{ color.color }</HexString>
			</Content>
        </ElementWrapper>
	);
};

export default Color;