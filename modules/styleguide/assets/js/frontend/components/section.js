import React from 'react';
import styled from 'styled-components';
import SectionTitle from './section-title';
import Font from './font';
import InnerWrapper from './global/inner-wrapper';

const Wrapper = styled.div`
	margin-top: 55px;
`;

const Content = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
`;

export default function Section( props ) {
	const { title, source, component, type } = props;

	return (
		<Wrapper>
			<SectionTitle>{ title }</SectionTitle>
			<InnerWrapper>
				<Content>
					{
						source.map( ( item ) => (

							<Font key={ font._id } font={ font } />
						) )
					}
				</Content>
			</InnerWrapper>
		</Wrapper>
	);
}

Section.propTypes = {
	title: PropTypes.string.isRequired,
	source: PropTypes.array.isRequired,
	component: PropTypes.oneOf( [ 'colors', 'fonts' ] ).isRequired,
	type: PropTypes.string,
};
