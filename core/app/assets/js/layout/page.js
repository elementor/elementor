import Header from './header';
import Sidebar from './sidebar';
import Content from './content';

export default function Page( props ) {
	return (
		<div className={ props.className }>
			<div className="dialog-widget dialog-lightbox-widget dialog-type-buttons dialog-type-lightbox elementor-templates-modal">
				<div className="dialog-widget-content dialog-lightbox-widget-content">
					<Header title={ props.title } buttons={ props.headerButtons } />
					<div className="dialog-message dialog-lightbox-message elementor-app__main">
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
