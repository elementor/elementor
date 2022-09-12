import { useLocation } from '@reach/router';
import Kit from '../models/kit';
import KitListItem from './kit-list-item';
import NewPageKitListItem from '../../../../onboarding/assets/js/components/new-page-kit-list-item';
import { CssGrid } from '@elementor/app-ui';

export default function KitList( props ) {
	const location = useLocation();

	const referrer = new URLSearchParams( location.pathname.split( '?' )?.[ 1 ] ).get( 'referrer' );

	return (
		<CssGrid spacing={ 24 } colMinWidth={ 290 }>
			{
				'onboarding' === referrer &&
				<NewPageKitListItem />
			}
			{
				props.data.map( ( model, index ) => (
					// The + 1 was added in order to start the map.index from 1 and not from 0.
					<KitListItem key={ model.id } model={ model } index={ index + 1 } queryParams={ props.queryParams?.search } source={ props.source } />
				) )
			}
		</CssGrid>
	);
}

KitList.propTypes = {
	data: PropTypes.arrayOf( PropTypes.instanceOf( Kit ) ),
	queryParams: PropTypes.shape( {
		search: PropTypes.string,
	} ),
	source: PropTypes.string,
};
