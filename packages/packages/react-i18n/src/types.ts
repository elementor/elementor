import { I18n as OriginalI18n } from '@wordpress/i18n';

// TODO: Add support for URL sources ('object' | 'url').
type SourceType = 'object';

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

export type I18nObjectSource = I18nBaseSource<'object'> & {
    data: JEDLocaleDataDomainFormat;
}

export type I18nSource = I18nObjectSource;

export type I18n = OriginalI18n & {
    isRTL: () => boolean;
    getLang: () => string;
}
