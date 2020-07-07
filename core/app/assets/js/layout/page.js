import Header from './header';
import Sidebar from './sidebar';
import Content from './content';

export default function Page( props ) {
	const uiTheme = elementorAppConfig.ui_theme;
	let userPrefersTheme = '';

	if ( 'auto' === uiTheme ) {
		if ( window.matchMedia && window.matchMedia( '(prefers-color-scheme: dark)' ).matches ) {
			userPrefersTheme = ' dark';
		}
	} else if ( 'dark' === uiTheme ) {
		userPrefersTheme = ' dark';
	}

	return (
		<div className={ props.className + userPrefersTheme }>
			<div className="dialog-widget dialog-lightbox-widget dialog-type-buttons dialog-type-lightbox elementor-templates-modal">
				<div className="dialog-widget-content dialog-lightbox-widget-content elementor-app">
					<Header title={ props.title } buttons={ props.headerButtons } />
					<div className="elementor-app__main">
						<Sidebar>
							{ props.sidebar }
						</Sidebar>
						<Content>
							{ props.content }
						</Content>
					</div>
				</div>
			</div>
		</div>
	);
}

Page.propTypes = {
	title: PropTypes.string,
	className: PropTypes.string,
	headerButtons: PropTypes.arrayOf( PropTypes.object ),
	sidebar: PropTypes.object,
	content: PropTypes.object.isRequired,
};

Page.defaultProps = {
	className: '',
};
