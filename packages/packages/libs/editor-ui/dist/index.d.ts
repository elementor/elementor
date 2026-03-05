import * as _emotion_styled from '@emotion/styled';
import * as _mui_system from '@mui/system';
import * as React$1 from 'react';
import { ReactNode, PropsWithChildren, ReactElement, MouseEvent as MouseEvent$1, RefObject, ComponentProps, ElementType, ComponentType } from 'react';
import * as _mui_material from '@mui/material';
import { MenuItemProps, MenuItemTextProps, TypographyProps, AlertProps, InfotipProps, BoxProps, ButtonProps, MenuList, DialogProps, DialogContentTextProps } from '@elementor/ui';

declare const CollapseIcon: _emotion_styled.StyledComponent<Omit<_mui_material.SvgIconProps, "ref"> & React$1.RefAttributes<SVGSVGElement> & _mui_system.MUIStyledCommonProps<_mui_material.Theme> & {
    open: boolean;
    disabled?: boolean;
}, {}, {}>;

type StaticItem<T = unknown> = T extends (...args: unknown[]) => unknown ? never : T;
type CallbackItem<T> = (isOpen: boolean) => T;
type CollapsibleValue<T> = CallbackItem<T> | StaticItem<T>;
type CollapsibleContentProps = React$1.PropsWithChildren<{
    defaultOpen?: boolean;
    titleEnd?: CollapsibleValue<ReactNode | string> | null;
}>;
declare const CollapsibleContent: ({ children, defaultOpen, titleEnd }: CollapsibleContentProps) => React$1.JSX.Element;
declare function getCollapsibleValue<T>(value: CollapsibleValue<T>, isOpen: boolean): T;

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

type MenuListItemProps = MenuItemProps & {
    menuItemTextProps?: MenuItemTextProps;
    primaryTypographyProps?: TypographyProps;
};
declare const MenuListItem: ({ children, menuItemTextProps, primaryTypographyProps, ...props }: MenuListItemProps) => React$1.JSX.Element;
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
    hasError?: boolean;
}
declare const WarningInfotip: React$1.ForwardRefExoticComponent<WarningInfotipProps & React$1.RefAttributes<unknown>>;

declare const GlobalDialog: () => React$1.JSX.Element | null;

type DialogContent = {
    component: ReactElement;
};
declare const openDialog: ({ component }: DialogContent) => void;
declare const closeDialog: () => void;

type Props$1 = {
    value: string;
    onSearch: (search: string) => void;
    placeholder: string;
    id?: string;
} & BoxProps;
declare const SearchField: ({ value, onSearch, placeholder, id, sx }: Props$1) => React$1.JSX.Element;

type Props = PropsWithChildren<{
    onSubmit?: () => void;
    'data-testid'?: string;
}>;
declare const Form: ({ children, onSubmit, "data-testid": dataTestId }: Props) => React$1.JSX.Element;

type CtaButtonProps = {
    href: string;
    showIcon?: boolean;
} & Omit<ButtonProps, 'href' | 'target' | 'startIcon' | 'color' | 'variant'>;
declare const CtaButton: ({ href, children, showIcon, ...props }: CtaButtonProps) => React$1.JSX.Element;

type InfotipCardProps = {
    title: string;
    content: string;
    assetUrl: string;
    ctaUrl: string;
    onClose: (e: MouseEvent) => void;
};
type PromotionInfotipProps = React$1.PropsWithChildren<InfotipCardProps & {
    open?: boolean;
}>;
declare const PromotionInfotip: ({ children, open, onClose, ...cardProps }: PromotionInfotipProps) => React$1.JSX.Element;

type PromotionPopoverCardProps = {
    title: string;
    content: string;
    ctaUrl: string;
    ctaText?: string;
    onClose: (e: MouseEvent$1) => void;
};
type PromotionPopoverProps = React$1.PropsWithChildren<PromotionPopoverCardProps & {
    open: boolean;
    placement?: InfotipProps['placement'];
    slotProps?: InfotipProps['slotProps'];
    anchorRef?: RefObject<HTMLElement | null>;
}>;
declare const PromotionPopover: ({ children, open, placement, slotProps, anchorRef, ...cardProps }: PromotionPopoverProps) => React$1.JSX.Element;

declare const PromotionChip: React$1.ForwardRefExoticComponent<React$1.RefAttributes<HTMLDivElement>>;

type PromotionAlertProps = {
    message: string;
    upgradeUrl: string;
};
declare const PromotionAlert: ({ message, upgradeUrl }: PromotionAlertProps) => React$1.JSX.Element;

declare function FloatingActionsBar({ actions, children }: PropsWithChildren<{
    actions: ReactElement[];
}>): React$1.JSX.Element;
declare function useFloatingActionsBar(): {
    open: boolean;
    setOpen: React$1.Dispatch<React$1.SetStateAction<boolean>>;
};

type PopoverBodyProps = PropsWithChildren<{
    height?: number | 'auto';
    width?: number;
    id?: string;
}>;
declare const PopoverBody: ({ children, height, width, id }: PopoverBodyProps) => React$1.JSX.Element;

declare const SectionPopoverBody: (props: ComponentProps<typeof PopoverBody>) => React$1.JSX.Element;

type PopoverHeaderProps = {
    title: React$1.ReactNode;
    onClose: () => void;
    icon?: React$1.ReactNode;
    actions?: React$1.ReactNode[];
};
declare const PopoverHeader: ({ title, onClose, icon, actions }: PopoverHeaderProps) => React$1.JSX.Element;

type VirtualizedItem<T, V extends string> = {
    type: T;
    value: V;
    disabled?: boolean;
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
    onChange?: (visibleItems: VirtualizedItem<T, V>[]) => void;
    menuListTemplate?: React$1.ComponentType<React$1.ComponentProps<typeof MenuList>>;
    menuItemContentTemplate?: (item: VirtualizedItem<T, V>) => React$1.ReactNode;
    categoryItemContentTemplate?: (item: VirtualizedItem<T, V>) => React$1.ReactNode;
    noResultsComponent?: React$1.ReactNode;
};
declare const ITEM_HEIGHT = 32;
declare const PopoverMenuList: <T, V extends string>({ items, onSelect, onClose, selectedValue, itemStyle, onChange, "data-testid": dataTestId, menuItemContentTemplate, categoryItemContentTemplate, noResultsComponent, menuListTemplate: CustomMenuList, }: PopoverMenuListProps<T, V>) => React$1.JSX.Element;
declare const StyledMenuList: _emotion_styled.StyledComponent<any, {}, {
    ref?: React$1.Ref<any> | undefined;
}>;

type PopoverActionProps = {
    title: string;
    visible?: boolean;
    icon: ElementType;
    content: ComponentType<{
        close: () => void;
    }>;
};
declare function PopoverAction({ title, visible, icon: Icon, content: PopoverContent }: PopoverActionProps): React$1.JSX.Element | null;

declare const SaveChangesDialog: {
    ({ children, onClose }: Pick<DialogProps, "children" | "onClose">): React$1.JSX.Element;
    Title: ({ children, onClose }: React$1.PropsWithChildren & {
        onClose?: () => void;
    }) => React$1.JSX.Element;
    Content: ({ children }: React$1.PropsWithChildren) => React$1.JSX.Element;
    ContentText: (props: DialogContentTextProps) => React$1.JSX.Element;
    Actions: ({ actions }: ConfirmationDialogActionsProps$1) => React$1.JSX.Element;
};
type Action = {
    label: string;
    action: () => void | Promise<void>;
};
type ConfirmationDialogActionsProps$1 = {
    actions: {
        cancel?: Action;
        confirm: Action;
        discard?: Action;
    };
};
declare const useDialog: () => {
    isOpen: boolean;
    open: () => void;
    close: () => void;
};

type ConfirmationDialogProps = Pick<DialogProps, 'open' | 'onClose' | 'children'>;
declare const ConfirmationDialog: {
    ({ open, onClose, children }: ConfirmationDialogProps): React$1.JSX.Element;
    Title: ({ children, icon: Icon, iconColor, }: ConfirmationDialogTitleProps) => React$1.JSX.Element;
    Content: ({ children }: React$1.PropsWithChildren) => React$1.JSX.Element;
    ContentText: (props: DialogContentTextProps) => React$1.JSX.Element;
    Actions: ({ onClose, onConfirm, cancelLabel, confirmLabel, color, onSuppressMessage, suppressLabel, }: ConfirmationDialogActionsProps) => React$1.JSX.Element;
};
type ConfirmationDialogTitleProps = React$1.PropsWithChildren<{
    icon?: React$1.ElementType;
    iconColor?: 'error' | 'secondary' | 'primary';
}>;
type ConfirmationDialogActionsProps = {
    onClose: () => void;
    onConfirm: () => void;
    cancelLabel?: string;
    confirmLabel?: string;
    color?: 'error' | 'secondary' | 'primary';
    onSuppressMessage?: () => void;
    suppressLabel?: string;
};

declare const SectionRefContext: React$1.Context<RefObject<HTMLElement> | null>;
declare const useSectionWidth: () => number;

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

declare const useTextFieldAutoSelect: () => React$1.RefObject<HTMLInputElement>;

declare const useCanvasClickHandler: (isActive: boolean, onClickAway: (e: MouseEvent) => void) => void;

export { CollapseIcon, CollapsibleContent, type CollapsibleValue, ConfirmationDialog, CtaButton, EditableField, EllipsisWithTooltip, FloatingActionsBar, Form, GlobalDialog, ITEM_HEIGHT, InfoAlert, InfoTipCard, IntroductionModal, MenuItemInfotip, MenuListItem, PopoverAction, type PopoverActionProps, PopoverBody, PopoverHeader, PopoverMenuList, type PopoverMenuListProps, PromotionAlert, PromotionChip, PromotionInfotip, PromotionPopover, SaveChangesDialog, SearchField, SectionPopoverBody, SectionRefContext, StyledMenuList, ThemeProvider, type VirtualizedItem, WarningInfotip, closeDialog, getCollapsibleValue, openDialog, useCanvasClickHandler, useDialog, useEditable, useFloatingActionsBar, useSectionWidth, useTextFieldAutoSelect };
