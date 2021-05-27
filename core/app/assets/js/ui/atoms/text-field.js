import { arrayToClassName } from '../../utils/utils';

import './text-field.scss';

export default function TextField( props ) {
	const classes = [ 'eps-text-field', props.className ],
		validProps = { ...props, className: arrayToClassName( classes ) };

	if ( validProps.multiline ) {
		delete validProps.multiline;

		return (
			<textarea { ...validProps } />
		);
	}

	return (
		<input { ...validProps } type="text" />
	);
}

TextField.propTypes = {
	className: PropTypes.string,
	multiline: PropTypes.bool,
	children: PropTypes.string,
};

TextField.defaultProps = {
	className: '',
};
