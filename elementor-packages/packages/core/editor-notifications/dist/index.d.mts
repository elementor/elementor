import { VariantType } from 'notistack';
import { ButtonProps } from '@elementor/ui';

declare function init(): void;

type NotificationData = {
    type: VariantType;
    message: string | React.ReactNode;
    id: string;
    additionalActionProps?: Partial<ButtonProps>[];
};

declare function notify(notification: NotificationData): void;
declare function NotifyReact(notification: NotificationData): void;

export { type NotificationData, NotifyReact, init, notify };
