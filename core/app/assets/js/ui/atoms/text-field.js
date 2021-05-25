import { arrayToClassName } from '../../utils/utils';

import './text-field.scss';

export default function TextField( props ) {
	const classes = [ 'eps-text-field', props.className ],
		tag = props.multiline ? 'textarea' : 'input',
		attrs = {
			className: arrayToClassName( classes ),
		};

	if ( props.multiline ) {
		if ( props.rows ) {
			attrs.rows = props.rows;
		}
	} else {
		attrs.type = 'text';
	}

	if ( props.placeholder ) {
		attrs.placeholder = props.placeholder;
	}

	const Element = () => React.createElement( tag, attrs, props.children );

	return <Element />;
}

TextField.propTypes = {
	className: PropTypes.string,
	placeholder: PropTypes.string,
	multiline: PropTypes.bool,
	rows: PropTypes.number,
};

TextField.defaultProps = {
	className: '',
	placeholder: '',
};
