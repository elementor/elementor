export declare type ItemStatus = 'applied' | 'not_applied';
export declare type Item = {
    id: number;
    status: ItemStatus;
    title: string;
    subTitle?: string;
    action: string;
};
