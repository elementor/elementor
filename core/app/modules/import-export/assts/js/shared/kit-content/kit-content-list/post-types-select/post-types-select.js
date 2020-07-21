import { useContext } from 'react';
import { Context as KitContext } from '../../../../context/kit-context';

import Grid from 'elementor-app/ui/grid/grid';
import Select2 from 'elementor-app/ui/molecules/select2.js';

import './post-types-select.scss';

export default function PostTypesSelect( props ) {
	const context = useContext( KitContext ),
		setPostTypes = ( event ) => {
			const selectedOptions = [ ...event.target.selectedOptions ].map( ( option ) => option.value );

			context.dispatch( { type: 'SET_POST_TYPES', value: selectedOptions } );
		},
		getPostTypesOptions = () => {
			const customPostTypes = elementorAppConfig[ 'import-export' ][ 'custom_post_types' ];

			if ( ! customPostTypes ) {
				const tempOptions = [
					{ label: 'Posts', value: 'post' },
					{ label: 'Pages', value: 'page' },
				];

				//return;
				return tempOptions;
			}

			return Object.entries( customPostTypes ).map( ( item, index ) => (
				<option key={index} value={ item[ 0 ] }>{ item[ 1 ] }</option>
			) );
		};

	return (
		<Grid container justify="center" className="kit-content-selection-container">
			<Select2
				multiple
				onChange={ setPostTypes }
				options={ getPostTypesOptions() }
				settings={ {
					width: '100%',
					containerCssClass: 'kit-content-select',
					placeholder: __( 'Select custom post types (maximum of 20 posts will be included)', 'elementor' ),
				} }
			/>
		</Grid>
	);
}

PostTypesSelect.propTypes = {
	options: PropTypes.array,
};
