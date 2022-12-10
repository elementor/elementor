import Text from 'elementor-app/ui/atoms/text';

export default function Included( { data } ) {
	return (
		<Text className="e-app-import-export-kit-data__included">
			{ data.filter( ( value ) => value ).join( ' | ' ) }
		</Text>
	);
}

Included.propTypes = {
	data: PropTypes.array,
};
