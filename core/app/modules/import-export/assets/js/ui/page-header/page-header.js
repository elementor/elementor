import Utils from 'elementor-app/utils/utils.js';

import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';

import './page-header.scss';

// Page header.
export default function PageHeader( props ) {
	const baseClassName = 'import-export-title',
		classes = [ baseClassName, props.className ];

	const handleMultiLine = ( content ) => {
		if ( Array.isArray( content ) ) {
			const multiLineArray = [];

			content.forEach( ( line, index ) => {
				if ( index ) {
					multiLineArray.push( <br key={ index } /> );
				}

				multiLineArray.push( line );
			} );

			return multiLineArray;
		}

		return content;
	};

	return (
		<div className={ Utils.arrayToClassName( classes ) }>
			{ props.heading && <Heading variant="display-3" className="import-export-title__primary">{ props.heading }</Heading> }
			{ props.description && <Text className="import-export-title__secondary">{ handleMultiLine( props.description ) }</Text> }
		</div>
	);
}

PageHeader.propTypes = {
	className: PropTypes.string,
	heading: PropTypes.string,
	description: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.array,
	] ),
};

PageHeader.defaultProps = {
	className: '',
};
