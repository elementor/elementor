import { useContext } from 'react';
import { Context as ExportContext } from '../../../../context/export';

import Grid from 'elementor-app/ui/grid/grid';

import './post-types-select.scss';

export default function PostTypesSelect( props ) {
	const contextData = useContext( ExportContext ),
		setPostTypes = ( event ) => {
			const selectedOptions = [ ...event.target.selectedOptions ].map( ( option ) => option.value );

			contextData.setPostTypes( selectedOptions );
		};

	return (
		<Grid container justify="center" className="kit-content-selection-container">
			<select onChange={ setPostTypes } className="kit-content-select" multiple>
				{
					Object.entries( elementorAppConfig[ 'import-export' ].custom_post_types ).map( ( item, index ) => (
						<option key={index} value={ item[ 0 ] }>{ item[ 1 ] }</option>
					) )
				}
			</select>
		</Grid>
	);
}

PostTypesSelect.propTypes = {
	options: PropTypes.array,
};
