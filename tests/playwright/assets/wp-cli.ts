export const wpCli = async ( command: string ) => {
	const port = ( 1 === Number( process.env.TEST_PARALLEL_INDEX ) ) ? 8889 : 8888;

	const { cli } = await import( '@elementor/wp-lite-env' );
	await cli( port, command );
};
