<?php

use Elementor\Modules\DataFlow\Actions_Registry;
use Elementor\Modules\DataFlow\Custom_Actions;
use ElementorEditorTesting\Elementor_Test_Base;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\DataFlow
 */
class Test_Custom_Actions extends Elementor_Test_Base {

	const DEFINITION = [
		'name' => 'acme/add-one',
		'label' => 'Add one',
		'args' => [
			'key' => [ 'type' => 'string', 'label' => 'Key' ],
			'unsupported' => [ 'type' => 'object' ],
		],
		'code' => "( { args, store } ) => { store.setState( args.key, ( v ) => v + 1 ); }",
	];

	public function setUp(): void {
		parent::setUp();

		Custom_Actions::register_post_type();
		Custom_Actions::reset();
		Actions_Registry::reset();
	}

	public function tearDown(): void {
		$this->act_as_admin();
		Custom_Actions::instance()->delete( self::DEFINITION['name'] );
		Custom_Actions::reset();
		Actions_Registry::reset();

		parent::tearDown();
	}

	public function test_save__stores_the_action_writes_a_script_and_registers_it() {
		// Arrange
		$this->act_as_admin();

		// Act
		$saved = Custom_Actions::instance()->save( self::DEFINITION );

		// Assert
		$this->assertSame( self::DEFINITION['code'], $saved['code'] );
		$this->assertSame( [ 'key' => [ 'type' => 'string', 'label' => 'Key' ] ], $saved['args'] );

		$registered = Actions_Registry::instance()->get( 'acme/add-one' );
		$this->assertSame( Actions_Registry::SOURCE_CUSTOM, $registered['source'] );
		$this->assertSame( [ 'key' ], array_keys( $registered['args'] ) );

		$file = wp_upload_dir()['basedir'] . '/' . get_post_meta( $this->find_post_id(), Custom_Actions::META_FILE, true );
		$this->assertFileExists( $file );
		$this->assertStringContainsString( 'window.elementorActions.register( "acme\/add-one"', file_get_contents( $file ) );
	}

	public function test_save__replaces_the_previous_script_when_the_code_changes() {
		// Arrange
		$this->act_as_admin();
		Custom_Actions::instance()->save( self::DEFINITION );
		$first_file = get_post_meta( $this->find_post_id(), Custom_Actions::META_FILE, true );

		// Act
		Custom_Actions::instance()->save( [ 'code' => '() => {}' ] + self::DEFINITION );

		// Assert
		$second_file = get_post_meta( $this->find_post_id(), Custom_Actions::META_FILE, true );
		$this->assertNotSame( $first_file, $second_file );
		$this->assertFileDoesNotExist( wp_upload_dir()['basedir'] . '/' . $first_file );
		$this->assertCount( 1, Custom_Actions::instance()->list() );
	}

	public function test_save__rejects_users_without_unfiltered_html() {
		// Arrange
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'editor' ] ) );
		$this->revoke_unfiltered_html();

		// Act
		$result = Custom_Actions::instance()->save( self::DEFINITION );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'forbidden', $result->get_error_code() );
	}

	/**
	 * @dataProvider invalid_definitions
	 */
	public function test_validate_definition__rejects_invalid_definitions( array $override, string $code ) {
		// Act
		$result = Custom_Actions::instance()->validate_definition( $override + self::DEFINITION );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( $code, $result->get_error_code() );
	}

	public function invalid_definitions(): array {
		return [
			'invalid name' => [ [ 'name' => 'NoNamespace' ], 'invalid_name' ],
			'reserved namespace' => [ [ 'name' => 'state/custom' ], 'reserved_name' ],
			'empty code' => [ [ 'code' => ' ' ], 'invalid_code' ],
			'closing script tag' => [ [ 'code' => '() => "</script>"' ], 'invalid_code' ],
		];
	}

	public function test_preview__registers_for_the_request_without_saving() {
		// Act
		$result = Custom_Actions::instance()->preview( self::DEFINITION );

		// Assert
		$this->assertTrue( $result );
		$this->assertTrue( Actions_Registry::instance()->has( 'acme/add-one' ) );
		$this->assertSame( [], Custom_Actions::instance()->list() );
	}

	private function find_post_id(): int {
		$posts = get_posts( [
			'post_type' => Custom_Actions::POST_TYPE,
			'fields' => 'ids',
		] );

		return (int) $posts[0];
	}

	private function revoke_unfiltered_html(): void {
		add_filter( 'map_meta_cap', function ( $caps, $cap ) {
			return 'unfiltered_html' === $cap ? [ 'do_not_allow' ] : $caps;
		}, 10, 2 );
	}
}
