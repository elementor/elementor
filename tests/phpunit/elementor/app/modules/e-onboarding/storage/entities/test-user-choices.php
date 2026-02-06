<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Storage\Entities;

use Elementor\App\Modules\E_Onboarding\Storage\Entities\User_Choices;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_User_Choices extends TestCase {

	public function test_from_array_and_to_array_are_symmetric() {
		// Arrange
		$data = [
			'building_for' => 'myself',
			'site_about' => [ 'portfolio', 'blog' ],
			'experience_level' => 'intermediate',
			'theme_selection' => 'modern-theme',
			'site_features' => [ 'gallery', 'contact_form' ],
		];

		// Act
		$choices = User_Choices::from_array( $data );
		$exported = $choices->to_array();

		// Assert
		$this->assertSame( $data, $exported );
	}

	public function test_empty_data_has_sensible_defaults() {
		// Act
		$choices = User_Choices::from_array( [] );

		// Assert
		$this->assertNull( $choices->get_building_for() );
		$this->assertSame( [], $choices->get_site_about() );
		$this->assertNull( $choices->get_experience_level() );
		$this->assertNull( $choices->get_theme_selection() );
		$this->assertSame( [], $choices->get_site_features() );
	}
}
