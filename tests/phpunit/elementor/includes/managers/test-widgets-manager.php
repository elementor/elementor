<?php
namespace Elementor\Tests\Phpunit\Includes\Elements;

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Widgets_Manager extends Elementor_Test_Base {

    public function test_translate_default_values_to_site_locale() {
		global $current_user, $locale;

        // Arrange
		$translations = [
			'en_US' => 'Add Your Heading Text Here',
			'he_IL' => 'כתוב את הכותרת כאן',
			'de_DE' => 'Gib hier deine Überschrift ein',
		];

		$config = [ 'heading' => [
			'controls' => [
				'title' => [
					'default' => $translations['en_US'],
				],
			],
		] ];

		foreach ( $translations as $locale1 => $translation1 ) {
			foreach ( $translations as $locale2 => $translation2 ) {
				// Act
				$locale = $locale1; // Site locale
				$current_user->locale = $locale2; // User locale

				$translated_config = plugin::$instance->widgets_manager->translate_default_values_to_site_locale( $config, __DIR__ . '/../../languages/' );

				// Assert
				$this->assertEquals( $translated_config['heading']['controls']['title']['default'], $translations[ $locale ] );
			}
		}
    }

}
