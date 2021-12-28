import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { arrayToClassName } from 'elementor-app/utils/utils';
import { ItemProvider } from '../context/item-context';

function Item( { item, level, className, children, ...props }, ref ) {
	return (
		<ItemProvider value={ { data: item, level } }>
			<div
				{ ...props }
				ref={ ref }
				className={ arrayToClassName( [
					{ [ Item.baseClassName ]: true },
					{ [ className ]: true },
				] ) }>
				{ children }
			</div>
		</ItemProvider>
	);
}

Item = forwardRef( Item );

export default Item;

Item.baseClassName = 'elementor-navigator__element';

Item.propTypes = {
	item: PropTypes.shape( {
		id: PropTypes.string,
		title: PropTypes.string,
		icon: PropTypes.string,
	} ),
	level: PropTypes.number,
	className: PropTypes.string,
	children: PropTypes.node,
};
