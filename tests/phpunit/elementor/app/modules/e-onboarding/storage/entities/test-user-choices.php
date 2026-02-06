<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Storage\Entities;

use Elementor\App\Modules\E_Onboarding\Storage\Entities\User_Choices;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_User_Choices extends TestCase {

	public function test_from_array_creates_instance_with_all_fields() {
		// Arrange
		$data = [
			'building_for' => 'myself',
			'site_about' => [ 'blog', 'portfolio' ],
			'experience_level' => 'intermediate',
			'theme_selection' => 'theme-123',
			'site_features' => [ 'contact_form', 'gallery' ],
		];

		// Act
		$choices = User_Choices::from_array( $data );

		// Assert
		$this->assertSame( 'myself', $choices->get_building_for() );
		$this->assertSame( [ 'blog', 'portfolio' ], $choices->get_site_about() );
		$this->assertSame( 'intermediate', $choices->get_experience_level() );
		$this->assertSame( 'theme-123', $choices->get_theme_selection() );
		$this->assertSame( [ 'contact_form', 'gallery' ], $choices->get_site_features() );
	}

	public function test_from_array_with_empty_data_creates_instance_with_defaults() {
		// Act
		$choices = User_Choices::from_array( [] );

		// Assert
		$this->assertNull( $choices->get_building_for() );
		$this->assertSame( [], $choices->get_site_about() );
		$this->assertNull( $choices->get_experience_level() );
		$this->assertNull( $choices->get_theme_selection() );
		$this->assertSame( [], $choices->get_site_features() );
	}

	public function test_to_array_returns_all_fields() {
		// Arrange
		$choices = new User_Choices();
		$choices->set_building_for( 'client' );
		$choices->set_site_about( [ 'ecommerce' ] );
		$choices->set_experience_level( 'beginner' );
		$choices->set_theme_selection( 'theme-456' );
		$choices->set_site_features( [ 'shop', 'blog' ] );

		// Act
		$array = $choices->to_array();

		// Assert
		$this->assertSame( [
			'building_for' => 'client',
			'site_about' => [ 'ecommerce' ],
			'experience_level' => 'beginner',
			'theme_selection' => 'theme-456',
			'site_features' => [ 'shop', 'blog' ],
		], $array );
	}

	public function test_setters_update_values() {
		// Arrange
		$choices = new User_Choices();

		// Act & Assert - building_for
		$choices->set_building_for( 'employer' );
		$this->assertSame( 'employer', $choices->get_building_for() );

		$choices->set_building_for( null );
		$this->assertNull( $choices->get_building_for() );

		// Act & Assert - site_about
		$choices->set_site_about( [ 'business', 'blog' ] );
		$this->assertSame( [ 'business', 'blog' ], $choices->get_site_about() );

		// Act & Assert - experience_level
		$choices->set_experience_level( 'advanced' );
		$this->assertSame( 'advanced', $choices->get_experience_level() );

		// Act & Assert - theme_selection
		$choices->set_theme_selection( 'custom-theme' );
		$this->assertSame( 'custom-theme', $choices->get_theme_selection() );

		// Act & Assert - site_features
		$choices->set_site_features( [ 'newsletter', 'social' ] );
		$this->assertSame( [ 'newsletter', 'social' ], $choices->get_site_features() );
	}

	public function test_from_array_and_to_array_are_symmetric() {
		// Arrange
		$original_data = [
			'building_for' => 'myself',
			'site_about' => [ 'portfolio', 'blog' ],
			'experience_level' => 'intermediate',
			'theme_selection' => 'modern-theme',
			'site_features' => [ 'gallery', 'contact_form' ],
		];

		// Act
		$choices = User_Choices::from_array( $original_data );
		$exported_data = $choices->to_array();

		// Assert
		$this->assertSame( $original_data, $exported_data );
	}
}
