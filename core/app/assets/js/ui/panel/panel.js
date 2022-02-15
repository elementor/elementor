import { arrayToClassName } from 'elementor-app/utils/utils.js';

import Card from 'elementor-app/ui/card/card';
import Collapse from 'elementor-app/molecules/collapse';
import PanelHeader from './panel-header';
import PanelHeadline from './panel-headline';
import PanelBody from './panel-body';

import './panel.scss';

export default function Panel( props ) {
	return (
		<Collapse isOpened={ props.isOpened }>
			<Card className={ arrayToClassName( [ 'eps-panel', props.className ] ) }>
				{ props.children }
			</Card>
		</Collapse>
	);
}

Panel.propTypes = {
	className: PropTypes.string,
	isOpened: PropTypes.bool,
	children: PropTypes.any.isRequired,
};

Panel.defaultProps = {
	className: '',
	isOpened: false,
};

Panel.Header = PanelHeader;
Panel.Headline = PanelHeadline;
Panel.Body = PanelBody;
