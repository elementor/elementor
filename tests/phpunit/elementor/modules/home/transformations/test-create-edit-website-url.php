<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Create_Edit_Website_Url;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Create_Edit_Website_Url extends PHPUnit_TestCase {

	private const DATA_KEY_EDIT_WEBSITE_URL = 'edit_website_url';
	private const DATA_KEY_TOP_WITH_LICENCES = 'top_with_licences';
	private const DATA_KEY_GET_STARTED = 'get_started';

	public function test_transform__returns_admin_action_url() {
		$transformation = new Create_Edit_Website_Url( [] );
		$original_data = $this->mock_home_screen_data();

		$transformed_data = $transformation->transform( $original_data );

		$this->assertArrayHasKey( self::DATA_KEY_EDIT_WEBSITE_URL, $transformed_data );
		$this->assertStringContainsString( 'action=elementor_edit_website_redirect', $transformed_data[ self::DATA_KEY_EDIT_WEBSITE_URL ] );
		$this->assertStringContainsString( '_wpnonce', $transformed_data[ self::DATA_KEY_EDIT_WEBSITE_URL ] );
		$this->assertStringContainsString( 'admin.php', $transformed_data[ self::DATA_KEY_EDIT_WEBSITE_URL ] );
	}

	private function mock_home_screen_data(): array {
		return [
			self::DATA_KEY_TOP_WITH_LICENCES => [],
			self::DATA_KEY_GET_STARTED => [],
		];
	}
}
