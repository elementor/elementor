import React from 'react';
import styled from "styled-components";
import SectionTitle from "../components/section-title";
import Color from "../components/color";
import Font from "../components/font";

const FontsSection = ( { title, source } ) => {

	const Wrapper = styled.div`
      display: flex;
	  flex-direction: column;
	`;

	return (
		<>
			<SectionTitle> { title } </SectionTitle>
			<Wrapper>
				{ source.map( ( font ) =>
					<Font key={ font._id }
					       font={ font }
					/> )
				}
			</Wrapper>
        </>
	);
};

export default FontsSection;