import Kit from '../models/kit';
import KitListCloudItem from './kit-list-cloud-item';
import { CssGrid } from '@elementor/app-ui';

export default function KitListCloud( props ) {
	return (
		<CssGrid spacing={ 24 } colMinWidth={ 290 }>
			{
				props.data.map( ( model, index ) => (
					<KitListCloudItem key={ model.id } model={ model } index={ index } source={ props.source } />
				) )
			}
		</CssGrid>
	);
}

KitListCloud.propTypes = {
	data: PropTypes.arrayOf( PropTypes.instanceOf( Kit ) ),
	source: PropTypes.string,
};
