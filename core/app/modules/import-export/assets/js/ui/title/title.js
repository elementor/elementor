import Utils from 'elementor-app/utils/utils.js';

import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';

import './title.scss';

export default function Title( props ) {
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
			{ props.primary && <Heading variant="display-3" className="import-export-title__primary">{ props.primary }</Heading> }
			{ props.secondary && <Text className="import-export-title__secondary">{ handleMultiLine( props.secondary ) }</Text> }
		</div>
	);
}

Title.propTypes = {
	className: PropTypes.string,
	primary: PropTypes.string,
	secondary: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.array,
	] ),
};

Title.defaultProps = {
	className: '',
};
