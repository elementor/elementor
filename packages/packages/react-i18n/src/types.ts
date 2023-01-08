import { I18n as OriginalI18n } from '@wordpress/i18n';

// TODO: Add support for URL sources ('jed-object' | 'jed-remote?').
type SourceType = 'jed-object';

type I18nBaseSource<TType extends SourceType> = {
    domain: string;
    type: TType;
}

export type JEDLocaleDataDomainFormat = {
    '': {
        domain: string;
        lang: string;
        'plural-forms': string;
    }
} | { [key: string]: string[] };

export type I18nJEDObjectSource = I18nBaseSource<'jed-object'> & {
    data: JEDLocaleDataDomainFormat;
}

export type I18nSource = I18nJEDObjectSource;

export type I18n = Pick<OriginalI18n, '__' | '_n' | '_x' | '_nx'> & {
    isRTL: () => boolean;
    getLocale: () => string;
}
