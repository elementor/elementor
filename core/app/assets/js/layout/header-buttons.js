import useAction from 'elementor-app/hooks/use-action';
import Button from './header-button';

export default function HeaderButtons( props ) {
	const action = useAction();
	const actionOnClose = () => {
		if ( props.onClose ) {
		} else if ( 'kit-library' === props?.referrer ) {
			elementorCommon.events.eventTracking(
				'kit-library/close',
				{
					placement: 'kit library',
					event: 'top bar close kit library',
				},
				{
					source: props.pageId,
					kit_name: props.kitName,
					view_type_clicked: props.pageId,
				},
			);
		}
		action.backToDashboard();
	};

	let tools = '';

	if ( props.buttons.length ) {
		const buttons = props.buttons.map( ( button ) => {
			return <Button key={ button.id } { ...button } />;
		} );

		tools = (
			<>
				{ buttons }
			</>
		);
	}

	return (
		<div className="eps-app__header-buttons">
			<Button
				text={ __( 'Close', 'elementor' ) }
				icon="eicon-close"
				className="eps-app__close-button"
				onClick={ actionOnClose }
			/>
			{ tools }
		</div>
	);
}

HeaderButtons.propTypes = {
	buttons: PropTypes.arrayOf( PropTypes.object ),
	onClose: PropTypes.func,
};

HeaderButtons.defaultProps = {
	buttons: [],
};
