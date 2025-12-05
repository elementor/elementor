<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Home\Transformations;

use Elementor\Core\Base\Document;
use Elementor\Core\Documents_Manager;
use Elementor\Modules\Home\Transformations\Create_Edit_Website_Url;
use Elementor\Plugin;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Create_Edit_Website_Url extends PHPUnit_TestCase {

	private Documents_Manager $original_documents_manager;
	private Test_Documents_Manager $test_documents_manager;
	private MockObject $document_mock;

	private const CREATE_NEW_PAGE_URL = 'http://example.com/wp-admin/post-new.php?post_type=page&elementor=true';
	private const EDIT_PAGE_URL = 'http://example.com/wp-admin/post.php?post=123&action=elementor';
	private const HOMEPAGE_ID = 123;

	public function setUp(): void {
		parent::setUp();

		$this->original_documents_manager = Plugin::$instance->documents;
		$this->mock_documents_manager();
	}

	public function tearDown(): void {
		Plugin::$instance->documents = $this->original_documents_manager;

		parent::tearDown();
	}

	public function test_transform__homepage_exists_but_not_built_with_elementor() {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', self::HOMEPAGE_ID );

		$this->document_mock->method( 'is_built_with_elementor' )
			->willReturn( false );

		$this->test_documents_manager->set_document( self::HOMEPAGE_ID, $this->document_mock );

		$transformation = new Create_Edit_Website_Url( [] );
		$original_data = $this->mock_home_screen_data();

		$transformed_data = $transformation->transform( $original_data );
		$expected_data = $this->mock_home_screen_data();
		$expected_data['edit_website_url'] = self::CREATE_NEW_PAGE_URL;

		$this->assertEquals( $expected_data, $transformed_data );
	}

	public function test_transform__homepage_exists_and_built_with_elementor() {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', self::HOMEPAGE_ID );

		$this->document_mock->method( 'is_built_with_elementor' )
			->willReturn( true );
		$this->document_mock->method( 'get_edit_url' )
			->willReturn( self::EDIT_PAGE_URL );

		$this->test_documents_manager->set_document( self::HOMEPAGE_ID, $this->document_mock );

		$transformation = new Create_Edit_Website_Url( [] );
		$original_data = $this->mock_home_screen_data();

		$transformed_data = $transformation->transform( $original_data );
		$expected_data = $this->mock_home_screen_data();
		$expected_data['edit_website_url'] = self::EDIT_PAGE_URL;

		$this->assertEquals( $expected_data, $transformed_data );
	}

	private function mock_documents_manager(): void {
		$this->test_documents_manager = new Test_Documents_Manager( self::CREATE_NEW_PAGE_URL );

		$this->document_mock = $this->getMockBuilder( Document::class )
			->disableOriginalConstructor()
			->onlyMethods( [ 'is_built_with_elementor', 'get_edit_url' ] )
			->getMock();

		Plugin::$instance->documents = $this->test_documents_manager;
	}

	private function mock_home_screen_data(): array {
		return [
			'top_with_licences' => [],
			'get_started' => [],
			'add_ons' => [],
		];
	}
}

class Test_Documents_Manager extends Documents_Manager {
	private static ?string $test_create_new_post_url = null;
	protected array $documents = [];

	public function __construct( string $create_new_post_url ) {
		self::$test_create_new_post_url = $create_new_post_url;
	}

	public function get( $post_id, $from_cache = true ) {
		return $this->documents[ $post_id ] ?? null;
	}

	public function set_document( int $post_id, $document ): void {
		$this->documents[ $post_id ] = $document;
	}

	public static function get_create_new_post_url( $post_type = 'page', $template_type = null ) {
		if ( null !== self::$test_create_new_post_url ) {
			return self::$test_create_new_post_url;
		}
		return parent::get_create_new_post_url( $post_type, $template_type );
	}
}
