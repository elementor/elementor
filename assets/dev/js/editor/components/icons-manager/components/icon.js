import PropTypes from 'prop-types'
import { Component, Fragment } from 'react'

export default class Icon extends Component {
	setSelected = () => {
		this.props.setSelectedHandler( this.props.data.selector, this.props.library )
	};
	render = () => {
		return <Fragment>
			<div
				className={ this.props.containerClass }
				key={ this.props.keyID }
				onClick={ this.setSelected }
				filter={ this.props.data.filter }>
				<i
					className={ this.props.className }
					data={ this.props.data }
				>
					<span>{ this.props.data.name }</span>
				</i>
			</div>
		</Fragment>;

	}
};

Icon.propTypes = {
  className: PropTypes.string,
  containerClass: PropTypes.string,
  data: PropTypes.object,
  keyID: PropTypes.string,
  library: PropTypes.string,
  selector: PropTypes.string,
  setSelectedHandler: PropTypes.func,
};