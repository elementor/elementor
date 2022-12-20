const { execSync } = require( 'child_process' );

const MARKED_POST_AUTHOR = 1234;
// Set all templates as pages and mark them using the post_author field
execSync( `npx wp-env run cli "wp db query \\"UPDATE wp_posts SET post_type='page', post_author=${ MARKED_POST_AUTHOR } WHERE post_type='elementor_library'\\""` );

// The pagesQueryResult constant will be in the following format:
// 'id\tpost_name\n4\tdefault-kit\n5\taccordion\n'
const pagesQueryResult = execSync( `npx wp-env run cli "wp db query \\"SELECT id, post_name FROM wp_posts WHERE post_author=${ MARKED_POST_AUTHOR }\\""` ).toString();

const pages = {};
const lines = pagesQueryResult.split( '\n' );
lines.splice( lines.length - 1, 1 ); // Remove footer (empty line)
lines.splice( 0, 1 ); // Remove header
lines.forEach( ( line ) => {
    const split = line.split( '\t' );
    const id = parseInt( split[ 0 ].trim(), 10 );
    const postName = split[ 1 ].trim();
    pages[ postName ] = id;
} );

module.exports = {
    /**
     *
     * @param {string} name
     * @return {number} Page ID
     */
    getPageId: ( name ) => pages[ name ],
};
