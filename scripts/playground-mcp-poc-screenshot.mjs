import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';

const ARTIFACTS = process.env.MCP_POC_ARTIFACTS ?? '/opt/cursor/artifacts';
const previewUrl = await readFile( join( ARTIFACTS, 'mcp-poc-preview-url.txt' ), 'utf8' ).then( ( s ) => s.trim() );
const postId = await readFile( join( ARTIFACTS, 'mcp-poc-post-id.txt' ), 'utf8' ).then( ( s ) => s.trim() );
const base = new URL( previewUrl ).origin;
const publicUrl = `${ base }/?p=${ postId }`;

const browser = await chromium.launch();
const context = await browser.newContext( {
	viewport: { width: 1280, height: 800 },
} );
const page = await context.newPage();

await page.goto( publicUrl, { waitUntil: 'networkidle', timeout: 120000 } );
await page.screenshot( { path: join( ARTIFACTS, 'mcp-poc-page-desktop.png' ), fullPage: true } );

const mobile = await browser.newContext( {
	viewport: { width: 390, height: 844 },
	isMobile: true,
} );
const mobilePage = await mobile.newPage();
await mobilePage.goto( publicUrl, { waitUntil: 'networkidle', timeout: 120000 } );
await mobilePage.screenshot( { path: join( ARTIFACTS, 'mcp-poc-page-mobile.png' ), fullPage: true } );

const html = await page.content();
const marker = await readFile( join( ARTIFACTS, 'mcp-poc-render-marker.txt' ), 'utf8' ).then( ( s ) => s.trim() ).catch( () => 'elementor-counter' );
const hasWidget = html.includes( marker );
await writeFile(
	join( ARTIFACTS, 'mcp-poc-render-check.json' ),
	JSON.stringify( { publicUrl, marker, hasWidget, htmlBytes: html.length }, null, 2 )
);

await browser.close();
console.log( JSON.stringify( { publicUrl, marker, hasWidget }, null, 2 ) );
