import { type VariantType } from 'notistack';
import { type ButtonProps } from '@elementor/ui';

declare module 'notistack' {
	interface VariantOverrides {
		promotion: true;
		info: true;
	}
}

export type NotificationData = {
	type: VariantType;
	message: string | React.ReactNode;
	id: string;
	additionalActionProps?: Partial< ButtonProps >[];
	autoHideDuration?: number;
};

type NotificationId = string;

export type Notifications = Record< NotificationId, NotificationData >;
