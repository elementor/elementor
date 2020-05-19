export default class Content extends React.Component {
	static propTypes = {
		children: PropTypes.object,
	};

	render() {
		return (
			<main className="elementor-app__content">
				{ this.props.children }
			</main>
		);
	}
}
