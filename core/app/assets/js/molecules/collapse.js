import { useState, useEffect } from 'react';
import { arrayToClassName } from 'elementor-app/utils/utils.js';

import { CollapseContext } from './collapse-context';

import CollapseToggle from './collapse-toggle';
import CollapseContent from './collapse-content';

import './collapse.scss';

export default function Collapse( props ) {
	const [ isOpened, setIsOpened ] = useState( props.isOpened ),
		classNameBase = 'e-app-collapse',
		classes = [ classNameBase, props.className, { [ classNameBase + '--opened' ]: isOpened } ],
		toggle = () => setIsOpened( ( prevState ) => ! prevState );

	useEffect( () => {
		if ( props.isOpened !== isOpened ) {
			setIsOpened( props.isOpened );
		}
	}, [ props.isOpened ] );

	useEffect( () => {
		if ( props.onChange ) {
			props.onChange( isOpened );
		}
	}, [ isOpened ] );

	return (
		<CollapseContext.Provider value={ { toggle } }>
			<div className={ arrayToClassName( classes ) }>
				{ props.children }
			</div>
		</CollapseContext.Provider>
	);
}

Collapse.propTypes = {
	className: PropTypes.string,
	isOpened: PropTypes.bool,
	onChange: PropTypes.func,
	children: PropTypes.oneOfType( [
		PropTypes.node,
		PropTypes.arrayOf( PropTypes.node ),
	] ),
};

Collapse.defaultProps = {
	className: '',
	isOpened: false,
};

Collapse.Toggle = CollapseToggle;
Collapse.Content = CollapseContent;
