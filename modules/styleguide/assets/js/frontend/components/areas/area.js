import React from 'react';
import { useSettings } from '../../contexts/settings';
import Loader from '../global/loader';
import AreaTitle from './area-title';
import Section from '../section';

export default function Area( props ) {
	const { config } = props;
	const { settings, isReady } = useSettings();

	if ( ! isReady ) {
		return <Loader />;
	}

	return (
		<>
			<AreaTitle name={ config.type }>{ config.title }</AreaTitle>
			{ config.sections.map( ( section ) => {
				const items = settings.get( config.type ).get( section.type );

				return items.length &&
					<Section key={ section.type }
						title={ section.title }
						items={ items }
						columns={ section.columns }
						component={ config.component }
						type={ section.type }
					/>;
			} ) }
		</>
	);
}

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
