import * as _tanstack_react_query from '@tanstack/react-query';

type Attachment = {
    id: number;
    url: string;
    height: number;
    width: number;
    alt: string;
    filename: string;
    title: string;
    mime: string;
    type: string;
    subtype: string;
    uploadedTo: number;
    filesize: {
        inBytes: number;
        humanReadable: string;
    };
    author: {
        id: number;
        name: string;
    };
    sizes: Record<string, {
        width: number;
        height: number;
        url: string;
    }>;
};

type OpenOptions = {
    mode?: 'upload' | 'browse';
};
type MediaType = 'image' | 'svg';
type Options = {
    mediaTypes: MediaType[];
    title?: string;
} & ({
    multiple: true;
    selected: Array<number | null>;
    onSelect: (val: Attachment[]) => void;
} | {
    multiple: false;
    selected: number | null;
    onSelect: (val: Attachment) => void;
});
declare function useWpMediaFrame(options: Options): {
    open: (openOptions?: OpenOptions) => void;
};

declare function useWpMediaAttachment(id: number | null): _tanstack_react_query.UseQueryResult<Attachment | null, Error>;

declare function getMediaAttachment({ id }: {
    id: number | null;
}): Promise<Attachment | null>;

export { type Attachment, type MediaType, type OpenOptions, getMediaAttachment, useWpMediaAttachment, useWpMediaFrame };
