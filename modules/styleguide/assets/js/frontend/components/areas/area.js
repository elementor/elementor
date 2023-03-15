import React from 'react';
import styled from 'styled-components';
import { useSettings } from '../../contexts/settings';
import Loader from '../global/loader';
import AreaTitle from './area-title';
import Section from '../section';

const Wrapper = styled.div`
	width: 100%;
	margin-top: 95px;
	min-height: 100px;

	@media (max-width: 1024px) {
		margin-top: 45px;
	}
`;

const Area = React.forwardRef( (
	props,
	ref,
) => {
	const { config } = props;
	const { settings, isReady } = useSettings();

	return (
		<Wrapper ref={ ref }>
			<AreaTitle name={ config.type }>{ config.title }</AreaTitle>
			{ ! isReady
				? <Loader />
				: <>
					{ config.sections.map( ( section ) => {
						const items = settings.get( config.type ).get( section.type );

						return items.length
							? (
								<Section
									key={ section.type }
									title={ section.title }
									items={ items }
									columns={ section.columns }
									component={ config.component }
									type={ section.type }
								/>
							)
							: null;
					} ) }
				</>
			}
		</Wrapper>
	);
} );

Area.propTypes = {
	config: PropTypes.shape( {
		type: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		sections: PropTypes.arrayOf( PropTypes.shape( {
			type: PropTypes.string.isRequired,
			title: PropTypes.string.isRequired,
			columns: PropTypes.object,
		} ) ).isRequired,
		component: PropTypes.func.isRequired,
	} ).isRequired,
};

export default Area;
