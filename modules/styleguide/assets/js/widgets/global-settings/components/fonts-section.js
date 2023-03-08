import React from 'react';
import styled from 'styled-components';
import SectionTitle from './section-title';
import Font from './font';
import InnerWrapper from '../areas/inner-wrapper';

const Wrapper = styled.div`
	margin-top:55px;
`;


const Content = styled.div`
  display: flex;
  flex-direction: column;
	width:100%;
`;

const FontsSection = ( { title, source } ) => {
	return (
		<Wrapper>
			<SectionTitle> { title } </SectionTitle>
			<InnerWrapper>
				<Content>
					{ source.map( ( font ) => <Font key={ font._id } font={ font } /> ) }
				</Content>
			</InnerWrapper>
		</Wrapper>
	);
};

export default FontsSection;
