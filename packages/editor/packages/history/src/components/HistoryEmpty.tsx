import useTranslation from '../hooks/useTranslation';
import emptyIcon from '../assets/images/empty-icon.svg';

export default function HistoryEmpty() {
	const { t } = useTranslation();

	return (
		<div id="elementor-panel-history-no-items">

			<img className="elementor-nerd-box-icon" src={ emptyIcon } alt={ t( 'No history icon' ) } />

			<div className="elementor-nerd-box-title">
				{ t( 'No History Yet' ) }
			</div>

			<div className="elementor-nerd-box-message">
				{ t( 'Once you start working, you\'ll be able to redo / undo any action you make in the editor.' ) }
			</div>

		</div>
	);
}
