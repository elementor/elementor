import * as _reduxjs_toolkit from '@reduxjs/toolkit';
import * as immer_dist_internal_js from 'immer/dist/internal.js';
import { PayloadAction } from '@elementor/store';

declare function init(): void;

declare function useActiveDocument(): Document | null;

declare function useActiveDocumentActions(): {
    save: () => Promise<any>;
    saveDraft: () => Promise<any>;
    saveTemplate: () => Promise<unknown>;
    copyAndShare: () => void;
};

declare function useHostDocument(): Document | null;

declare function useNavigateToDocument(): (id: number) => Promise<void>;

type ExitTo = 'dashboard' | 'all_posts' | 'this_post';
type Document = {
    id: number;
    title: string;
    type: {
        value: string;
        label: string;
    };
    status: {
        value: string;
        label: string;
    };
    links: {
        platformEdit: string;
        permalink: string;
    };
    isDirty: boolean;
    isSaving: boolean;
    isSavingDraft: boolean;
    userCan: {
        publish?: boolean;
    };
    permissions: {
        allowAddingWidgets: boolean;
        showCopyAndShare: boolean;
    };
};
type ExtendedWindow = Window & {
    elementor: {
        documents: {
            documents: Record<string, V1Document>;
            getCurrentId: () => number;
            getInitialId: () => number;
            getCurrent: () => V1Document;
            invalidateCache: () => void;
        };
        getPreferences: (key: 'exit_to') => ExitTo;
    };
};
type V1Document = {
    id: number;
    config: {
        type: string;
        user: {
            can_publish: boolean;
        };
        revisions: {
            current_id: number;
        };
        panel: {
            title: string;
            allow_adding_widgets: boolean;
            show_copy_and_share: boolean;
        };
        status: {
            value: string;
            label: string;
        };
        urls: {
            exit_to_dashboard: string;
            permalink: string;
            main_dashboard: string;
            all_post_type: string;
        };
    };
    editor: {
        isChanged: boolean;
        isSaving: boolean;
    };
    container: {
        settings: V1Model<{
            post_title: string;
            exit_to: ExitTo;
        }>;
    };
};
type V1Model<T> = {
    get: <K extends keyof T = keyof T>(key: K) => T[K];
};

type State = {
    entities: Record<Document['id'], Document>;
    activeId: Document['id'] | null;
    hostId: Document['id'] | null;
};
declare const slice: _reduxjs_toolkit.Slice<State, {
    init(state: immer_dist_internal_js.WritableDraft<State>, { payload }: PayloadAction<State>): void;
    activateDocument(state: immer_dist_internal_js.WritableDraft<State>, action: PayloadAction<Document>): void;
    setAsHost(state: immer_dist_internal_js.WritableDraft<State>, action: PayloadAction<Document["id"]>): void;
    updateActiveDocument(state: immer_dist_internal_js.WritableDraft<State>, action: PayloadAction<Partial<Document>>): void;
    startSaving(state: immer_dist_internal_js.WritableDraft<State>): void;
    endSaving(state: immer_dist_internal_js.WritableDraft<State>, action: PayloadAction<Document>): void;
    startSavingDraft: (state: immer_dist_internal_js.WritableDraft<State>) => void;
    endSavingDraft(state: immer_dist_internal_js.WritableDraft<State>, action: PayloadAction<Document>): void;
    markAsDirty(state: immer_dist_internal_js.WritableDraft<State>): void;
    markAsPristine(state: immer_dist_internal_js.WritableDraft<State>): void;
}, "documents">;

declare function getCurrentDocument(): Document | null;

declare function getV1DocumentsManager(): {
    documents: Record<string, V1Document>;
    getCurrentId: () => number;
    getInitialId: () => number;
    getCurrent: () => V1Document;
    invalidateCache: () => void;
};
declare function setDocumentModifiedStatus(status: boolean): void;

export { type Document, type ExitTo, type ExtendedWindow, type V1Document, useActiveDocument as __useActiveDocument, useActiveDocumentActions as __useActiveDocumentActions, useHostDocument as __useHostDocument, useNavigateToDocument as __useNavigateToDocument, getCurrentDocument, getV1DocumentsManager, init, setDocumentModifiedStatus, slice };
