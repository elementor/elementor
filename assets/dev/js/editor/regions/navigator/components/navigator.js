import Header from './header';
import Icon from 'elementor-app/ui/atoms/icon';
import ItemList from './item-list';
import { ListStateProvider } from '../context/list-state-context';
import useElement from '../hooks/use-element';
import Empty from './empty';

export default function Navigator() {
	const { element } = useElement();

	const handleClose = () => {
		$e.run( 'navigator/close' );
	};

	return (
		<div id="elementor-navigator__inner">
			<ListStateProvider>
				<Header onClose={ handleClose } />
				<div id="elementor-navigator__elements">
					{ element.elements.length ?
						<ItemList elements={ element.elements } /> :
						<Empty /> }
				</div>
				<div id="elementor-navigator__footer">
					<Icon className="eicon-ellipsis-h" />
				</div>
			</ListStateProvider>
		</div>
	);
}
