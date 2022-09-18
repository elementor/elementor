import { Item, OnItemClick } from '../types';

type Props = {
	item: Item,
	onClick: OnItemClick,
	isCurrent: boolean,
};

const HistoryItem : React.VFC<Props> = ( props ) => {
	return (
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
		<div
			className={ `elementor-history-item elementor-history-item-${ props.item.status } ${ props.isCurrent ? 'elementor-history-item-current' : '' }` }
			onClick={ ( e : React.MouseEvent<HTMLElement> ) => {
				props.onClick( e, {
					id: props.item.id,
				} );
			} }
		>
			<div className="elementor-history-item__details">
				<span className="elementor-history-item__title">
					{ props.item.title }
				</span>{ ' ' }

				{
					props.item.subTitle && (
						<>
							<span className="elementor-history-item__subtitle">
								{ props.item.subTitle }
							</span>{ ' ' }
						</>
					)
				}

				<span className="elementor-history-item__action">
					{ props.item.action }
				</span>
			</div>

			<div className="elementor-history-item__icon">
				<span className="eicon" aria-hidden="true"></span>
			</div>
		</div>
	);
};

export default HistoryItem;
