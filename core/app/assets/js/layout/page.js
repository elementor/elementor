import Header from './header';
import Sidebar from './sidebar';
import Content from './content';
import Footer from './footer';

import Theme from 're-styled/theme';

export default function Page( props ) {
	const isDarkMode = document.body.classList.contains( `eps-theme-dark` ),
		themeConfig = {
			variants: {
				light: ! isDarkMode,
				dark: isDarkMode,
			},
		},
		AppSidebar = () => {
			if ( ! props.sidebar ) {
				return;
			}
			return (
				<Sidebar>
					{ props.sidebar }
				</Sidebar>
			);
		},
		AppFooter = () => {
			if ( ! props.footer ) {
				return;
			}
			return (
				<Footer>
					{props.footer}
				</Footer>
			);
		};

	return (
		<Theme config={ themeConfig }>
			<div className={`eps-app__lightbox ${ props.className }`}>
				<div className="eps-app">
					<Header title={ props.title } buttons={ props.headerButtons } titleRedirectRoute={ props.titleRedirectRoute } />
					<div className="eps-app__main">
						{ AppSidebar() }
						<Content>
							{ props.content }
						</Content>
					</div>
					{ AppFooter() }
				</div>
			</div>
		</Theme>
	);
}

Page.propTypes = {
	title: PropTypes.string,
	titleRedirectRoute: PropTypes.string,
	className: PropTypes.string,
	headerButtons: PropTypes.arrayOf( PropTypes.object ),
	sidebar: PropTypes.object,
	content: PropTypes.object.isRequired,
	footer: PropTypes.object,
};

Page.defaultProps = {
	className: '',
};
