import { type VariantType } from 'notistack';
import { type ButtonProps } from '@elementor/ui';

export type NotificationData = {
	type: VariantType;
	message: string | React.ReactNode;
	id: string;
	additionalActionProps?: Partial< ButtonProps >[];
};

type NotificationId = string;

export type Notifications = Record< NotificationId, NotificationData >;
