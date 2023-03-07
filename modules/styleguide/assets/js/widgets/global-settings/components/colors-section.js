import React from 'react';
import Color from './color';
import SectionTitle from './section-title';
import styled from 'styled-components';

const Wrapper = styled.div`
  margin-top:55px;
`;

const Content = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const ColorsSection = ( { title, source, type } ) => {
	return (
		<Wrapper>
			<SectionTitle> { title } </SectionTitle>
			<Content>
				{ source.map( ( color ) =>
					<Color key={ color._id }
						color={ color }
						type={ type }
					/> )
				}
			</Content>
		</Wrapper>
	);
};

export default ColorsSection;
