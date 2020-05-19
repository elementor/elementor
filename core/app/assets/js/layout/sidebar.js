export default class Sidebar extends React.Component {
	static propTypes = {
		children: PropTypes.object,
	};

	render() {
		return (
			<div className="elementor-app__sidebar">
				{ this.props.children }
			</div>
		);
	}
}
