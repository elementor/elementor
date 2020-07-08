import Button from './button';

import './add-new-button.scss';

export default class AddNewButton extends Button {
	getClassName() {
		let className = this.props.className;

		if ( this.props.size ) {
			className += ' eps-add-new-button--' + this.props.size;
		}

		return className;
	}

	static propTypes = {
		...Button.propTypes,
		text: PropTypes.string,
		size: PropTypes.string,
	};

	static defaultProps = {
		...Button.defaultProps,
		className: 'eps-add-new-button',
		text: __( 'Add New', 'elementor-pro' ),
		icon: 'eicon-plus',
	};
}
