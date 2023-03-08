import React from 'react';
import Color from './color';
import SectionTitle from './section-title';
import styled from 'styled-components';
import InnerWrapper from "../areas/inner-wrapper";

const Wrapper = styled.div`
  margin-top:55px;
`;

const Content = styled.div`
  display: flex;
  flex-wrap: wrap;
	width:100%;
`;

const ColorsSection = ( { title, source, type } ) => {
	return (
		<Wrapper>
			<SectionTitle> { title } </SectionTitle>
			<InnerWrapper>
				<Content>
					{ source.map( ( color ) =>
						<Color key={ color._id }
							color={ color }
							type={ type }
						/> )
					}
				</Content>
			</InnerWrapper>
		</Wrapper>
	);
};

export default ColorsSection;
