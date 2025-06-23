import * as React$1 from 'react';
import { ReactNode, PropsWithChildren } from 'react';
import { MenuItemProps, AlertProps, InfotipProps, MenuList } from '@elementor/ui';
import * as _emotion_styled from '@emotion/styled';

type EllipsisWithTooltipProps<T extends React$1.ElementType> = {
    maxWidth?: React$1.CSSProperties['maxWidth'];
    title: string;
    as?: T;
} & React$1.ComponentProps<T>;
declare const EllipsisWithTooltip: <T extends React$1.ElementType>({ maxWidth, title, as, ...props }: EllipsisWithTooltipProps<T>) => React$1.JSX.Element;

declare const EditableField: React$1.ForwardRefExoticComponent<Omit<any, "ref"> & React$1.RefAttributes<unknown>>;

type IntroductionModalProps = React$1.PropsWithChildren<{
    open: boolean;
    handleClose: (shouldShowAgain: boolean) => void;
    title?: string;
}>;
declare const IntroductionModal: ({ open, handleClose, title, children }: IntroductionModalProps) => React$1.JSX.Element;

declare function ThemeProvider({ children }: {
    children: React$1.ReactNode;
}): React$1.JSX.Element;

declare const MenuListItem: ({ children, ...props }: MenuItemProps) => React$1.JSX.Element;
declare const MenuItemInfotip: React$1.ForwardRefExoticComponent<{
    showInfoTip?: boolean;
    children: React$1.ReactNode;
    content: string;
} & {
    children?: React$1.ReactNode | undefined;
} & React$1.RefAttributes<unknown>>;

type InfoTipCardProps = {
    content: ReactNode;
    svgIcon: ReactNode;
    learnMoreButton?: {
        label: string;
        href: string;
    };
    ctaButton?: {
        label: string;
        onClick: () => void;
    };
};
declare const InfoTipCard: ({ content, svgIcon, learnMoreButton, ctaButton }: InfoTipCardProps) => React$1.JSX.Element;

declare const InfoAlert: (props: AlertProps) => React$1.JSX.Element;

interface WarningInfotipProps extends PropsWithChildren {
    open: boolean;
    title?: string;
    text: string;
    placement: InfotipProps['placement'];
    width?: string | number;
    offset?: number[];
}
declare const WarningInfotip: React$1.ForwardRefExoticComponent<WarningInfotipProps & React$1.RefAttributes<unknown>>;

type PopoverHeaderProps = {
    title: string;
    onClose: () => void;
    icon?: React$1.ReactNode;
    actions?: React$1.ReactNode[];
};
declare const PopoverHeader: ({ title, onClose, icon, actions }: PopoverHeaderProps) => React$1.JSX.Element;

type VirtualizedItem<T, V extends string> = {
    type: T;
    value: V;
    label?: string;
    icon?: React$1.ReactNode;
    secondaryText?: string;
    [key: string]: unknown;
};
type PopoverMenuListProps<T, V extends string> = {
    items: VirtualizedItem<T, V>[];
    onSelect: (value: V) => void;
    onClose: () => void;
    selectedValue?: V;
    itemStyle?: (item: VirtualizedItem<T, V>) => React$1.CSSProperties;
    'data-testid'?: string;
    onChange?: (params: {
        getVirtualIndexes: () => number[];
    }) => void;
    menuListTemplate?: React$1.ComponentType<React$1.ComponentProps<typeof MenuList>>;
    menuItemContentTemplate?: (item: VirtualizedItem<T, V>) => React$1.ReactNode;
    noResultsComponent?: React$1.ReactNode;
};
declare const ITEM_HEIGHT = 32;
declare const PopoverMenuList: <T, V extends string>({ items, onSelect, onClose, selectedValue, itemStyle, onChange, "data-testid": dataTestId, menuItemContentTemplate, noResultsComponent, menuListTemplate: CustomMenuList, }: PopoverMenuListProps<T, V>) => React$1.JSX.Element;
declare const StyledMenuList: _emotion_styled.StyledComponent<any, {}, {
    ref?: React$1.Ref<any> | undefined;
}>;

declare const PopoverScrollableContent: React$1.ForwardRefExoticComponent<{
    height?: number | "auto";
    width?: number;
} & {
    children?: React$1.ReactNode | undefined;
} & React$1.RefAttributes<HTMLDivElement>>;

type Props = {
    value: string;
    onSearch: (search: string) => void;
    placeholder: string;
};
declare const PopoverSearch: ({ value, onSearch, placeholder }: Props) => React$1.JSX.Element;

type UseEditableParams = {
    value: string;
    onSubmit: (value: string) => unknown;
    validation?: (value: string) => string | null;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onError?: (error: string | null) => void;
};
declare const useEditable: ({ value, onSubmit, validation, onClick, onError }: UseEditableParams) => {
    readonly ref: React$1.MutableRefObject<HTMLElement | null>;
    readonly isEditing: boolean;
    readonly openEditMode: () => void;
    readonly closeEditMode: () => void;
    readonly value: string;
    readonly error: string | null;
    readonly getProps: () => {
        suppressContentEditableWarning?: boolean | undefined;
        value: string;
        role: "textbox";
        contentEditable: boolean;
        onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
        onKeyDown: (event: React.KeyboardEvent) => void;
        onInput: (event: React.ChangeEvent<HTMLSpanElement>) => void;
        onBlur: () => void;
    };
};

export { EditableField, EllipsisWithTooltip, ITEM_HEIGHT, InfoAlert, InfoTipCard, IntroductionModal, MenuItemInfotip, MenuListItem, PopoverHeader, PopoverMenuList, type PopoverMenuListProps, PopoverScrollableContent, PopoverSearch, StyledMenuList, ThemeProvider, type VirtualizedItem, WarningInfotip, useEditable };
