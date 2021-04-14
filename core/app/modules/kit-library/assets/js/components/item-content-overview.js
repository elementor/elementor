import ContentType from '../models/content-type';
import ItemContentOverviewGroup from './item-content-overview-group';

import './item-content-overview.scss';

export default function ItemContentOverview( props ) {
	return props.documentsByType.map( ( contentType ) => (
		<ItemContentOverviewGroup key={ contentType.id } contentType={ contentType }/>
	) );
}

ItemContentOverview.propTypes = {
	documentsByType: PropTypes.arrayOf(
		PropTypes.instanceOf( ContentType )
	),
};
