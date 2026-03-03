import * as React from 'react';
import { ReactNode } from 'react';

type V4ActivationModalProps = {
    onClose: () => void;
    header: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    rightPanel?: ReactNode;
    rightPanelBackgroundColor?: string;
};
declare const V4ActivationModal: ({ onClose, header, children, footer, rightPanel, rightPanelBackgroundColor, }: V4ActivationModalProps) => React.JSX.Element;

type ModalHeaderProps = {
    title: string;
    subtitle: string;
};
declare const ModalHeader: ({ title, subtitle }: ModalHeaderProps) => React.JSX.Element;

type ModalFooterProps = {
    helpText: string;
    learnMoreText: string;
    learnMoreUrl: string;
};
declare const ModalFooter: ({ helpText, learnMoreText, learnMoreUrl }: ModalFooterProps) => React.JSX.Element;

type FeatureItemProps = {
    title: string;
    subtitle: string;
    selected: boolean;
    onClick: () => void;
};
declare const FeatureItem: ({ title, subtitle, selected, onClick }: FeatureItemProps) => React.JSX.Element;

declare function useAutoplayCarousel<T>(items: T[], intervalMs?: number): {
    selectedItem: T;
    selectItem: (item: T) => void;
};

declare function App(): React.JSX.Element;

declare function init(): void;

export { App, FeatureItem, ModalFooter, ModalHeader, V4ActivationModal, init, useAutoplayCarousel };
