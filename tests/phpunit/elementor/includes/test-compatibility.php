<?php

namespace Elementor\Tests\Phpunit\Includes\Elements;

use Elementor\Compatibility;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Compatibility extends Elementor_Test_Base {

    public function test_wpml_set_editor_language__wpml_exist() {
        // Arrange
        $user_interface = 'user_interface';

        // Act
        $is_wpml_exist = Compatibility::wpml_set_editor_language( $user_interface );

        // Assert
        $this->assertNotEmpty( $is_wpml_exist );
    }

    public function test_wpml_set_editor_language__wpml_not_exist() {
        global $sitepress;

        // Arrange
        $user_interface = 'user_interface';
        $sitepress = null;

        // Act
        $is_wpml_exist = Compatibility::wpml_set_editor_language( $user_interface );

        // Assert
        $this->assertNotTrue( $is_wpml_exist );

        $sitepress = new Mock_WPML();
    }

    public function test_wpml_set_editor_language__user_interface_is_in_the_correct_language() {
        global $sitepress, $current_user;

        // Arrange
        $languages = [
			'en' => 'en_US',
			'he' => 'he_IL',
		];

        $user_interface = ['user_language', 'site_language'];

        foreach ( $user_interface as $interface_language ) {
            foreach ( $languages as $lang1 => $locale1 ) {
                foreach ( $languages as $lang2 => $locale2 ) {

                    $sitepress->default_language = $lang1;
                    $current_user->locale = $locale2;

                    // Act
                    $language = Compatibility::wpml_set_editor_language( $interface_language );
                    
                    //Assert
                    $this->assertEquals( $language, $interface_language === 'user_language' ? $lang2 : $lang1 );
                }
            }
        }
    }
}

class Mock_WPML {

    public $default_language = 'en';

    public function get_language_code_from_locale( $locale ) {
		if( 'he_IL' === $locale ){
            return 'he';
        }

		return 'en';
	}

    public function get_default_language() {
		return $this->default_language;
	}

    public function get_locale_from_language_code( $code ) {
		if( 'he' === $code ){
            return 'he_IL';
        }

		return 'en_US';
	}

    public function switch_lang( $code = null, $cookie_lang = false ) {
        // too complicated to mock
	}
}

$GLOBALS[ 'sitepress' ] = new Mock_WPML();
