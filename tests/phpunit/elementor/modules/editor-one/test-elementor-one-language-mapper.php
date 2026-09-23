<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Classes\Elementor_One_Language_Mapper;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Elementor_One_Language_Mapper extends PHPUnit_TestCase {

	/**
	 * @dataProvider data_map_wordpress_locale_to_elementor_one_language
	 */
	public function test_map_wordpress_locale_to_elementor_one_language( string $wordpress_locale, string $expected ) {
		$result = Elementor_One_Language_Mapper::map_wordpress_locale_to_elementor_one_language( $wordpress_locale );

		$this->assertSame( $expected, $result );
	}

	public function data_map_wordpress_locale_to_elementor_one_language() {
		return [
			'empty' => [ '', 'en' ],
			'english_us' => [ 'en_US', 'en-US' ],
			'hebrew' => [ 'he_IL', 'he-IL' ],
			'language_only' => [ 'de', 'de' ],
		];
	}

	/**
	 * @dataProvider data_get_top_bar_language_codes
	 */
	public function test_get_top_bar_language_codes( string $wordpress_locale, array $expected ) {
		$result = Elementor_One_Language_Mapper::get_top_bar_language_codes( $wordpress_locale );

		$this->assertSame( $expected, $result );
	}

	public function data_get_top_bar_language_codes() {
		return [
			'english_language_code' => [ 'en', [ 'en' ] ],
			'english_us_includes_both_codes' => [ 'en_US', [ 'en', 'en-US' ] ],
			'hebrew_includes_english' => [ 'he_IL', [ 'en', 'he-IL' ] ],
			'empty_defaults_to_english_only' => [ '', [ 'en' ] ],
		];
	}
}
