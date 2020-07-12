import { useState, useEffect, useContext } from 'react';
import { Context as ExportContext } from '../../../context/export';

import './kit-content-select.scss';

export default function KitContentSelect( props ) {
	const contextData = useContext( ExportContext ),
		setPostTypes = ( event ) => {
			const selectedOptions = [ ...event.target.selectedOptions ].map( ( option ) => option.value );

			contextData.setPostTypes( selectedOptions );
		};

	return (
		<select onChange={ setPostTypes } className="kit-content-select" multiple>
			{
				props.options.map( ( option, index ) => <option key={ index }>{ option }</option> )
			}
		</select>
	);
}

KitContentSelect.propTypes = {
	options: PropTypes.array,
};

KitContentSelect.defaultProps = {};
