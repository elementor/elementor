export const Context = React.createContext();

class ExportContext extends React.Component {
	static propTypes = {
		children: PropTypes.object.isRequired,
	};

	constructor( props ) {
		super( props );

		this.state = {
			exportContent: [
				{
					type: 'templates',
					data: {
						title: 'Global Templates',
						description: 'Saved Templates, Site Parts, Popups, Global Widgets',
						isProNeeded: true,
						select: [
							'Item 1',
							'Item 2',
						],
						notice: 'Site Parts, Global widgets and Popups will are available only when Elementor Pro license is Connected',
					},
				},
				{
					type: 'styles',
					data: {
						title: 'Global Styles And Settings',
						description: 'Theme Style, Global Colors and Typography, Layout, Lightbox and Site Identity settings',
					},
				},
				{
					type: 'content',
					data: {
						title: 'Content',
						description: 'Published pages, posts, related taxonomies, menu and custom post types.',
						contentSelection: [
							'Option 1',
							'Option 2',
							'Option 3',
						],
					},
				},
			],
		};
	}

	componentDidMount() {
	}

	render() {
		return (
			<Context.Provider value={ this.state }>
				{ this.props.children }
			</Context.Provider>
		);
	}
}

export const ExportConsumer = Context.Consumer;
export default ExportContext;
