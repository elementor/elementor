import { useContext } from 'react';
import { Context as KitContext } from '../../../../context/kit-context';

import Grid from 'elementor-app/ui/grid/grid';
import Select2 from 'elementor-app/ui/molecules/select2.js';

import './post-types-select.scss';

export default function PostTypesSelect( props ) {
	const context = useContext( KitContext ),
		setPostTypes = ( event ) => {
			const selectedOptions = [ ...event.target.selectedOptions ].map( ( option ) => option.value );

			props.setIsPosts( selectedOptions.length );

			context.dispatch( { type: 'SET_POST_TYPES', value: selectedOptions } );
		},
		getPostTypesOptions = () => {
			const customPostTypes = elementorAppConfig[ 'import-export' ][ 'custom_post_types' ];

			if ( ! customPostTypes ) {
				const tempOptions = [ { label: 'Posts', value: 'post' }, { label: 'Pages', value: 'page' } ];

				//return;
				return tempOptions;
			}

			return Object.entries( customPostTypes ).map( ( item, index ) => (
				<option key={index} value={ item[ 0 ] }>{ item[ 1 ] }</option>
			) );
		};

	return (
		<Grid container justify="center" className="kit-content-selection-container">
			<select onChange={ setPostTypes } className="kit-content-select" multiple>

			</select>
			<Select2  onChange={ ( event ) => { console.log( event.target.selectedOptions ); } } options={ getPostTypesOptions() }>

			</Select2>
		</Grid>
	);
}

PostTypesSelect.propTypes = {
	options: PropTypes.array,
};
