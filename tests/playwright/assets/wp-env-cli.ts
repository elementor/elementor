const { cli } = await import( 'wp-test-server' );

export const wpEnvCli = async ( command: string ) => {
	const port = ( 1 === Number( process.env.TEST_PARALLEL_INDEX ) ) ? '8889' : '8888';
	await cli( port, command );
};
