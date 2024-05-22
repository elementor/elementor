import React from 'react';
import styled, { css } from 'styled-components';
import SectionTitle from './section-title';
import DivBase from './global/div-base';
import InnerWrapper from './global/inner-wrapper';

const Wrapper = styled( DivBase )`
	margin-top: 55px;
`;

const Content = styled( DivBase )`
	display: flex;
	width: 100%;

	${ ( { flex } ) => flex && css`
		flex-direction: ${ 'column' === flex ? 'column' : 'row' };
		flex-wrap: ${ 'column' === flex ? 'nowrap' : 'wrap' };
	` };
`;

export default function Section( props ) {
	const { title, items, columns, component: Item, type, flex = 'row' } = props;

	return (
		<Wrapper>
			<SectionTitle>{ title }</SectionTitle>
			<InnerWrapper>
				<Content flex={ flex }>
					{ items.map( ( item ) => {
						return (
							<Item
								key={ item._id }
								item={ item }
								type={ type ? type : null }
								columns={ columns }
							/>
						);
					} ) }
				</Content>
			</InnerWrapper>
		</Wrapper>
	);
}

Section.propTypes = {
	title: PropTypes.string.isRequired,
	items: PropTypes.array.isRequired,
	columns: PropTypes.shape( {
		desktop: PropTypes.number,
		mobile: PropTypes.number,
	} ),
	component: PropTypes.func.isRequired,
	type: PropTypes.string,
	flex: PropTypes.oneOf( [ 'row', 'column' ] ),
};
