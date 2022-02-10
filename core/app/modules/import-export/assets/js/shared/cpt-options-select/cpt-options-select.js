import { useContext } from 'react';
import { SharedContext } from '../../context/shared-context/shared-context-provider';
import Select2 from '../../../../../../assets/js/ui/molecules/select2';
import Text from 'elementor-app/ui/atoms/text';

export default function CptSelections( { options } ) {
	const sharedContext = useContext( SharedContext );

	const selectedCpt = ( e ) => {
		sharedContext.dispatch( { type: 'SET_CPT', payload: Array.from( e.target.selectedOptions ).map( ( { value } ) => value ) } );
	};

	return (
		<>
			<Text variant="sm" tag="p" className="e-app-export-kit-content__description">
				Custom Post Type
			</Text>
			<Select2
				multiple
				settings={ { width: '100%' } }
				options={options}
				onChange={( e ) => selectedCpt( e )}
			/>
			<Text variant="sm" tag="span" className="e-app-export-kit-content__small-notice">
				Select custom posts types to include. Up to 20 of the most recent.
			</Text>
		</>
	);
}

CptSelections.propTypes = {
	options: PropTypes.array.isRequired,
};
