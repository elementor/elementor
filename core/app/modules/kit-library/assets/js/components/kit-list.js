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
				props.data.map( ( model ) => (
					<KitListItem key={ model.id } model={ model } />
				) )
			}
		</CssGrid>
	);
}

KitList.propTypes = {
	data: PropTypes.arrayOf( PropTypes.instanceOf( Kit ) ),
};
