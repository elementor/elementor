import Kit from '../models/kit';
import KitListItem from './kit-list-item';
import { CssGrid } from '@elementor/app-ui';

// What was the purpose of this component?
// Are we breaking something?
export default function KitList( props ) {
	return (
		<CssGrid spacing={ 24 } colMinWidth={ 290 }>
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
