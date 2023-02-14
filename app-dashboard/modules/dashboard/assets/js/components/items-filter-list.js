import Collapse from './collapse';
import { useState, useMemo } from 'react';
import { Button } from '@elementor/app-ui';
const ItemsFilterList = ( props ) => {
	const [ isOpen, setIsOpen ] = useState( props.itemsByType.isOpenByDefault );

	const items = useMemo( () => {
		return props.itemsByType.data;
	}, [ props.itemsByType.data ] );

	return (
		<Collapse
			className="e-kit-library__tags-filter-list"
			title={ props.itemsByType.label }
			isOpen={ isOpen }
			onChange={ setIsOpen }
			onClick={ ( collapseState, title ) => {
				props.onCollapseChange?.( collapseState, title );
			} }
		>
			<div className="e-kit-library__tags-filter-list-container">
				{
					items.map( ( item ) => {
						console.log( item );
						// eslint-disable-next-line jsx-a11y/label-has-associated-control
						return 'link' === item.linkType
							? <Button
									key={ item.text }
									url={ item.url }
									target="_blank"
									rel="noreferrer"
									className={ `e-kit-library__tags-filter-list-item eps-menu-item__link eps-menu-item__external-link` }
									text={ item.text }
									icon={ 'eicon-editor-external-link' }
							/> : <Button
								key={ item.text }
								text={ item.text }
								className={ `e-kit-library__tags-filter-list-item eps-menu-item__link` }
								url={ item.url }
							/>
					} )
				}
			</div>
		</Collapse>
	);
};

ItemsFilterList.propTypes = {
	itemsByType: PropTypes.shape( {
		key: PropTypes.string,
		label: PropTypes.string,
		data: PropTypes.arrayOf( PropTypes.object ),
		isOpenByDefault: PropTypes.bool,
	} ),
	onCollapseChange: PropTypes.func,
	onChange: PropTypes.func,
};

export default React.memo( ItemsFilterList );
