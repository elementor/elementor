import React from 'react';
import Color from "../components/color";
import SectionTitle from "../components/section-title";
import styled from "styled-components";

const ColorsSection = ( { title, source, width } ) => {

	const Wrapper = styled.div`
      display: flex;
      flex-wrap: wrap;
	`;

	return (
		<>
			<SectionTitle> { title } </SectionTitle>
			<Wrapper>
				{ source.map( ( color ) =>
					<Color key={ color._id }
					       color={ color }
					       width={ width }
					/> )
				}
			</Wrapper>
        </>
	);
};

export default ColorsSection;