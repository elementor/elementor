import { useState } from 'react';
import { Text } from '@elementor/app-ui';
import PropTypes from 'prop-types';
import './quota-notification.scss';

const QUOTA_NOTIFICATION_CLASSNAME = 'e-kit-library__quota-notification';

export default function QuotaNotification( { usagePercentage } ) {
	const [ isDismissed, setIsDismissed ] = useState( false );

	const handleDismiss = () => {
		setIsDismissed( true );
	};

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
				message: (
					<>
						<strong>{ __( 'Website template storage is full.', 'elementor' ) }</strong>
						{ ' ' }
						{ __( 'Get more space ', 'elementor' ) }
					</>
				),
				actions: [
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
				// translators: %s: usage percentage
				message: (
					<>
						<strong>{ sprintf( __( 'Website template storage is %s%% full.', 'elementor' ), Math.round( usagePercentage ) ) }</strong>
						{ ' ' }
						{ __( 'Get more space ', 'elementor' ) }
					</>
				),
				actions: [
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

	if ( ! state || ! content || isDismissed ) {
		return null;
	}

	return (
		<div className={ `${ QUOTA_NOTIFICATION_CLASSNAME } ${ QUOTA_NOTIFICATION_CLASSNAME }--${ state }` }>
			<div className={ `${ QUOTA_NOTIFICATION_CLASSNAME }__content` }>
				<i className={ `${ QUOTA_NOTIFICATION_CLASSNAME }__icon ${ content.icon }` } />
				<div className={ `${ QUOTA_NOTIFICATION_CLASSNAME }__message` }>
					<Text tag="span">
						{ content.message }
					</Text>
					{ content.actions.map( ( action, index ) => (
						<span key={ index }>
							{ index > 0 && <Text tag="span"> { __( 'or', 'elementor' ) } </Text> }
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
			<button
				className={ `${ QUOTA_NOTIFICATION_CLASSNAME }__dismiss` }
				onClick={ handleDismiss }
				aria-label={ __( 'Dismiss notification', 'elementor' ) }
			>
				<i className="eicon-close" />
			</button>
		</div>
	);
}

QuotaNotification.propTypes = {
	usagePercentage: PropTypes.number.isRequired,
};
