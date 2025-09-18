declare global {
    interface Window {
        components: {
            created: any[];
            modified: any[];
            deleted: any[];
        };
    }
}

export {};