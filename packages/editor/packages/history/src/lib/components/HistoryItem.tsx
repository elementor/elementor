import { ApplyItem, Item } from "../types/Item";

type Props = Item & {
	onClick: ApplyItem,
	isCurrent: boolean,
};

const HistoryItem : React.VFC<Props> = ( props ) => {
	return (
		<div
			className={ `elementor-history-item elementor-history-item-${ props.status } ${ props.isCurrent ? 'elementor-history-item-current' : '' }` }
			onClick={ ( e : React.MouseEvent<HTMLElement> ) => {
				props.onClick( e, {
					id: props.id,
				} );
			} }
		>
			<div className="elementor-history-item__details">
				<span className="elementor-history-item__title">{ props.title }</span>{ ' ' }
				{
					props.subTitle && (
						<>
							<span className="elementor-history-item__subtitle">{ props.subTitle }</span>{ ' '}
						</>
					)
				}
				<span className="elementor-history-item__action">{ props.action }</span>
			</div>

			<div className="elementor-history-item__icon">
				<span className="eicon" aria-hidden="true"></span>
			</div>
		</div>
	);
}

export default HistoryItem;
