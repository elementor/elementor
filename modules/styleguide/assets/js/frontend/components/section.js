import React from 'react';
import styled from 'styled-components';
import SectionTitle from './section-title';
import Font from './item/font';
import Color from './item/color';
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
	const { title, source, component, type } = props;

	const getComponent = ( props ) => {
		Font: <Font { ...props } />,
		Color: <Color { ...props } />,
	};

	const CurrentComponent = getComponent( component );

	return (
		<Wrapper>
			<SectionTitle>{ title }</SectionTitle>
			<InnerWrapper>
				<Content>
					{
						source.map( ( item ) => {
							let Component = getComponent( component, item, type );
							return (
								<CurrentComponent
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
	component: PropTypes.oneOf( [ 'Color', 'Font' ] ).isRequired,
	type: PropTypes.string,
};
