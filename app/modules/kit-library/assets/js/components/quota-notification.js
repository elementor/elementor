import { Text } from '@elementor/app-ui';
import PropTypes from 'prop-types';
import './quota-notification.scss';

const QUOTA_NOTIFICATION_CLASSNAME = 'e-kit-library__quota-notification';

export default function QuotaNotification( { usagePercentage, onDismiss } ) {
	const getNotificationState = () => {
		if ( usagePercentage >= 100 ) {
			return 'alert';
		}
		if ( usagePercentage >= 80 ) {
			return 'warning';
		}

		return null;
	};

	const getNotificationContent = () => {
		const state = getNotificationState();

		if ( 'alert' === state ) {
			return {
				icon: 'eicon-alert',
				message: __( 'Website template storage is full. Get more space by ', 'elementor' ),
				actions: [
					{
						text: __( 'Cleaning up space', 'elementor' ),
						href: '#',
						type: 'link',
					},
					{
						text: __( 'Upgrade now', 'elementor' ),
						href: 'https://go.elementor.com/go-pro-cloud-website-templates-library-advanced/',
						type: 'link',
					},
				],
			};
		}

		if ( 'warning' === state ) {
			return {
				icon: 'eicon-warning-full',
				message: `${ __( 'Website template storage is', 'elementor' ) } ${ Math.round( usagePercentage ) }% ${ __( 'full. Get more space by ', 'elementor' ) }`,
				actions: [
					{
						text: __( 'Cleaning up space', 'elementor' ),
						href: '#',
						type: 'link',
					},
					{
						text: __( 'Upgrade now', 'elementor' ),
						href: 'https://go.elementor.com/go-pro-cloud-website-templates-library-advanced/',
						type: 'link',
					},
				],
			};
		}

		return null;
	};

	const state = getNotificationState();
	const content = getNotificationContent();

	if ( ! state || ! content ) {
		return null;
	}

	return (
		<div className={ `${ QUOTA_NOTIFICATION_CLASSNAME } ${ QUOTA_NOTIFICATION_CLASSNAME }--${ state }` }>
			<div className={ `${ QUOTA_NOTIFICATION_CLASSNAME }__content` }>
				<i className={ `${ QUOTA_NOTIFICATION_CLASSNAME }__icon ${ content.icon }` } />
				<div className={ `${ QUOTA_NOTIFICATION_CLASSNAME }__message` }>
					<Text variant="xs" tag="span">
						{ content.message }
					</Text>
					{ content.actions.map( ( action, index ) => (
						<span key={ index }>
							{ index > 0 && <Text variant="xs" tag="span"> { __( 'or', 'elementor' ) } </Text> }
							<a
								className={ `${ QUOTA_NOTIFICATION_CLASSNAME }__action-link` }
								href={ action.href }
								target="_blank"
								rel="noopener noreferrer"
							>
								{ action.text }
							</a>
						</span>
					) ) }
				</div>
			</div>
			{ onDismiss && (
				<button
					className={ `${ QUOTA_NOTIFICATION_CLASSNAME }__dismiss` }
					onClick={ onDismiss }
					aria-label={ __( 'Dismiss notification', 'elementor' ) }
				>
					<i className="eicon-close" />
				</button>
			) }
		</div>
	);
}

QuotaNotification.propTypes = {
	usagePercentage: PropTypes.number.isRequired,
	onDismiss: PropTypes.func,
};
