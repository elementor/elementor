import Button from './button';

import './add-new-button.scss';

export default class AddNewButton extends Button {
	getClassName() {
		return this.props.className;
	}

	getText() {
		return this.props.hideText ? '' : <Typography>{ this.props.text }</Typography>;
	}

	static propTypes = {
		...Button.propTypes,
		text: PropTypes.string,
	};

	static defaultProps = {
		...Button.defaultProps,
		className: 'eps-add-new-button',
		text: __( 'Add New', 'elementor-pro' ),
		icon: 'eicon-plus',
	};
}
