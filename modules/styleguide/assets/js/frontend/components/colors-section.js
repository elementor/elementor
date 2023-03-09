import React from 'react';
import Color from './color';
import SectionTitle from './section-title';
import styled from 'styled-components';
import InnerWrapper from './global/inner-wrapper';

const Wrapper = styled.div`
	margin-top:55px;
`;

const Content = styled.div`
	display: flex;
	flex-wrap: wrap;
	width:100%;
`;

export default function ColorsSection( props ) {
	const { title, source, type } = props;

	return (
		<Wrapper>
			<SectionTitle>{ title }</SectionTitle>
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
}

ColorsSection.propTypes = {
	title: PropTypes.string.isRequired,
	source: PropTypes.array.isRequired,
	type: PropTypes.string.isRequired,
};
