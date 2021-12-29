import { forwardRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Icon from 'elementor-app/ui/atoms/icon';
import ItemIcon from 'elementor-regions/navigator/components/item-icon';
import ItemTitle from 'elementor-regions/navigator/components/item-title';
import { arrayToClassName } from 'elementor-app/utils/utils';
import { useItemContext } from '../context/item-context';

function ItemHandle( { className, style, onToggleFolding, onTitleEdit, children, ...props }, ref ) {
	const { data: item, level } = useItemContext();

	/**
	 * Toggle the element folding state in the store.
	 *
	 * @void
	 */
	const handleToggleFolding = useCallback(
		( e ) => {
			e.stopPropagation();
			onToggleFolding();
		},
		[ item.id ]
	);

	return (
		<div
			{ ...props }
			ref={ ref }
			className={ arrayToClassName( [
				{ 'elementor-navigator__item': true },
				{ [ className ]: true },
			] ) }
			style={ {
				[ `padding${ elementorCommon.config.isRTL ? 'Right' : 'Left' }` ]: level * 10,
				...style,
			} }>
			{ false === onToggleFolding ||
				<div className="elementor-navigator__element__list-toggle" onClick={ handleToggleFolding }>
					<Icon className="eicon-sort-down"/>
				</div>
			}
			<ItemIcon icon={ item.icon } />
			<ItemTitle title={ item.title } onTitleEdit={ onTitleEdit } />
			{ children }
		</div>
	);
}

export default forwardRef( ItemHandle );

ItemHandle.propTypes = {
	className: PropTypes.string,
	style: PropTypes.string,
	onToggleFolding: PropTypes.func,
	onTitleEdit: PropTypes.func,
	children: PropTypes.node,
};
