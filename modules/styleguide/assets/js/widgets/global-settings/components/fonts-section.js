import React from 'react';
import styled from 'styled-components';
import SectionTitle from './section-title';
import Font from './font';

const Wrapper = styled.div`
  margin-top:55px;
`;


const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const FontsSection = ( { title, source } ) => {
	return (
		<Wrapper>
			<SectionTitle> { title } </SectionTitle>
			<Content>
				{ source.map( ( font ) => <Font key={ font._id } font={ font } /> ) }
			</Content>
		</Wrapper>
	);
};

export default FontsSection;
