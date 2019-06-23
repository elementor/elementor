import PropTypes from 'prop-types';
import { Component } from 'react';

export default class Icon extends Component {
	setSelected = () => {
		this.props.setSelectedHandler( this.props.data.selector, this.props.library );
	};
	render = () => {
		return (
			<div className={ this.props.containerClass } key={ this.props.keyID } onClick={ this.setSelected } filter={ this.props.data.filter }>
				<div className="elementor-icons-manager__tab__item__content">
					<i className={ 'elementor-icons-manager__tab__item__icon ' + this.props.className }>
					</i>
					<div className={ 'elementor-icons-manager__tab__item__name' }>{ this.props.data.name }</div>
				</div>
			</div>
		);
	};
}

Icon.propTypes = {
  className: PropTypes.string,
  containerClass: PropTypes.string,
  data: PropTypes.object,
  keyID: PropTypes.string,
  library: PropTypes.string,
  selector: PropTypes.string,
  setSelectedHandler: PropTypes.func,
};
