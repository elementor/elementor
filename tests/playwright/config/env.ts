import { resolve } from 'path';
import { config as loadDotenv } from 'dotenv';

loadDotenv( { path: resolve( __dirname, '../../../.env' ) } );

const isCI = Boolean( process.env.CI );
const env = process.env.ENV || 'local';
const isStg = 'stg' === env;

const localDevServer = 'http://127.0.0.1:9400';
const localTestServer = 'http://127.0.0.1:9400';
const ciDevServer = 'http://localhost:8888';
const ciTestServer = 'http://localhost:8889';

function resolveBaseURL(): string {
	if ( process.env.BASE_URL ) {
		return process.env.BASE_URL;
	}
	if ( isStg ) {
		return process.env.WP_BASE_URL_STG || 'https://wp.stg.elementor.red';
	}
	return isCI ? ciDevServer : localDevServer;
}

function resolveTestServerURL(): string {
	if ( isStg ) {
		return process.env.WP_TEST_SERVER_STG || resolveBaseURL();
	}
	return isCI ? ciTestServer : localTestServer;
}

export const config = {
	env,
	isStg,
	isCI,

	wp: {
		username: process.env.USERNAME || 'admin',
		password: process.env.PASSWORD || 'password',
		baseURL: resolveBaseURL(),
		testServerURL: resolveTestServerURL(),
	},

	cfAccess: {
		clientId: process.env.CF_ACCESS_CLIENT_ID || '',
		clientSecret: process.env.CF_ACCESS_CLIENT_SECRET || '',
	},

	hasCfAccess: Boolean(
		process.env.CF_ACCESS_CLIENT_ID && process.env.CF_ACCESS_CLIENT_SECRET,
	),
};

export const cfHeaders: Record<string, string> = config.hasCfAccess
	? {
		'CF-Access-Client-Id': config.cfAccess.clientId,
		'CF-Access-Client-Secret': config.cfAccess.clientSecret,
	}
	: {};
