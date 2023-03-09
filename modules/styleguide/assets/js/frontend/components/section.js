import React from 'react';
import styled, { css } from 'styled-components'
import SectionTitle from './section-title';
import InnerWrapper from './global/inner-wrapper';

const Wrapper = styled.div`
  margin-top: 55px;
`;

const Content = styled.div`
  display: flex;
  width: 100%;

  ${ ( { flex } ) => flex && css`
    flex-direction: ${ 'column' === flex ? 'column' : 'row' };
    flex-wrap: ${ 'column' === flex ? 'nowrap' : 'wrap' };
  ` };
`;

export default function Section( props ) {
	const { title, source, component: Item, type, flex = 'row' } = props;

	return (
		<Wrapper>
			<SectionTitle>{ title }</SectionTitle>
			<InnerWrapper>
				<Content flex={ flex }>
					{
						source.map( ( item ) => {
							return (
								<Item
									key={ item._id }
									item={ item }
									type={ type ? type : null }
								/>
							);
						} )
					}
				</Content>
			</InnerWrapper>
		</Wrapper>
	);
}

Section.propTypes = {
	title: PropTypes.string.isRequired,
	source: PropTypes.array.isRequired,
	component: PropTypes.func.isRequired,
	type: PropTypes.string,
};
