import { useContext } from 'react';
import { Context as KitContext } from '../../../../context/kit-content';

import Grid from 'elementor-app/ui/grid/grid';

import './post-types-select.scss';

export default function PostTypesSelect( props ) {
	const contextData = useContext( KitContext ),
		setPostTypes = ( event ) => {
			const selectedOptions = [ ...event.target.selectedOptions ].map( ( option ) => option.value );

			contextData.setPostTypes( selectedOptions );
		},
		getpostTypesOptions = () => {
			const customPostTypes = elementorAppConfig[ 'import-export' ]?.custom_post_types;

			if ( ! customPostTypes ) {
				//return;
				return (
					<>
						<option value="Posts">Posts</option>
						<option value="Pages">Pages</option>
					</>
				);
			}

			return Object.entries( customPostTypes ).map( ( item, index ) => (
				<option key={index} value={ item[ 0 ] }>{ item[ 1 ] }</option>
			) );
		};

	return (
		<Grid container justify="center" className="kit-content-selection-container">
			<select onChange={ setPostTypes } className="kit-content-select" multiple>
				{ getpostTypesOptions() }
			</select>
		</Grid>
	);
}

PostTypesSelect.propTypes = {
	options: PropTypes.array,
};
