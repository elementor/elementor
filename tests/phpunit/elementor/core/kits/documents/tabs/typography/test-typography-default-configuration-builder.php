<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\kits\documents\tabs\typography;

use Elementor\Core\Kits\Documents\Tabs\Typography\Default_Typography_Type;
use Elementor\Core\Kits\Documents\Tabs\Typography\Typography_Control_Type;
use Elementor\Core\Kits\Documents\Tabs\Typography\Typography_Default_Configuration_Builder;
use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Typography_Default_Configuration_Builder extends Elementor_Test_Base {

	private $typography_key = Typography_Default_Configuration_Builder::TYPOGRAPHY_GROUP_PREFIX . 'typography';
	private $configuration_builder;
	private $size_40_px;
	private $size_30_px = [];
	private $size_0_px = [];
	private $size_16_px = [];

	public function setUp() {
		parent::setUp();

		$this->size_40_px = $this->size_to_px_array( '40' );
		$this->size_30_px = $this->size_to_px_array( '30' );
		$this->size_16_px = $this->size_to_px_array( '16' );
		$this->size_0_px = $this->size_to_px_array( '0' );
		$this->configuration_builder = new Typography_Default_Configuration_Builder();
		$this->expected_default_configuration = $this->setup_basic_configuration();
		$this->expected_post_3_7_configuration = $this->setup_3_7_configuration();
	}

	/**
	 * @dataProvider old_elementor_versions
	 */
	public function test_should_build_primary_defaults_for_pre_3_7( $elementor_version ) {
		//Arrange
		$this->setup_elementor_version( $elementor_version );

		//Act
		$typography = $this->configuration_builder->build_typography( Default_Typography_Type::PRIMARY );

		//Assert
		$this->assertEqualSets( $this->expected_default_configuration[ Default_Typography_Type::PRIMARY ], $typography );
	}


	/**
	 * @dataProvider old_elementor_versions
	 */
	public function test_should_build_secondary_defaults_for_pre_3_7( $elementor_version ) {
		//Arrange
		$this->setup_elementor_version( $elementor_version );

		//Act
		$typography = $this->configuration_builder->build_typography( Default_Typography_Type::SECONDARY );

		//Assert
		$this->assertEqualSets( $this->expected_default_configuration[ Default_Typography_Type::SECONDARY ], $typography );
	}

	/**
	 * @dataProvider old_elementor_versions
	 */
	public function test_should_build_text_defaults_for_pre_3_7( $elementor_version ) {
		//Arrange
		$this->setup_elementor_version( $elementor_version );

		//Act
		$typography = $this->configuration_builder->build_typography( Default_Typography_Type::TEXT );

		//Assert
		$this->assertEqualSets( $this->expected_default_configuration[ Default_Typography_Type::TEXT ], $typography );
	}

	/**
	 * @dataProvider old_elementor_versions
	 */
	public function test_should_build_accent_defaults_for_pre_3_7( $elementor_version ) {
		//Arrange
		$this->setup_elementor_version( $elementor_version );

		//Act
		$typography = $this->configuration_builder->build_typography( Default_Typography_Type::ACCENT );

		//Assert
		$this->assertEqualSets( $this->expected_default_configuration[ Default_Typography_Type::ACCENT ], $typography );
	}

	/**
	 * @dataProvider new_elementor_versions
	 */
	public function test_should_build_primary_defaults_for_3_7_and_higher( $wordpress_version ) {
		//Arrange
		$this->setup_elementor_version( $wordpress_version );

		//Act
		$typography = $this->configuration_builder->build_typography( Default_Typography_Type::PRIMARY );

		//Assert
		$this->assertEqualSets( $this->expected_post_3_7_configuration[ Default_Typography_Type::PRIMARY ], $typography );
	}

	/**
	 * @dataProvider new_elementor_versions
	 */
	public function test_should_build_secondary_defaults_for_3_7_1_and_higher( $wordpress_version ) {
		//Arrange
		$this->setup_elementor_version( $wordpress_version );

		//Act
		$typography = $this->configuration_builder->build_typography( Default_Typography_Type::SECONDARY );

		//Assert
		$this->assertEqualSets( $this->expected_post_3_7_configuration[ Default_Typography_Type::SECONDARY ], $typography );
	}

	/**
	 * @dataProvider new_elementor_versions
	 */
	public function test_should_build_text_defaults_for_3_7_1_and_higher( $wordpress_version ) {
		//Arrange
		$this->setup_elementor_version( $wordpress_version );

		//Act
		$typography = $this->configuration_builder->build_typography( Default_Typography_Type::TEXT );

		//Assert
		$this->assertEqualSets( $this->expected_post_3_7_configuration[ Default_Typography_Type::TEXT ], $typography );
	}

	/**
	 * @dataProvider new_elementor_versions
	 */
	public function test_should_build_accent_defaults_for_3_7_1_and_higher( $wordpress_version ) {
		//Arrange
		$this->setup_elementor_version( $wordpress_version );

		//Act
		$typography = $this->configuration_builder->build_typography( Default_Typography_Type::ACCENT );

		//Assert
		$this->assertEqualSets( $this->expected_post_3_7_configuration[ Default_Typography_Type::ACCENT ], $typography );
	}

	public function old_elementor_versions() {
		return [
			'3.1'  => [ '3.1' ],
			'3.2'  => [ '3.2' ],
			'3.3.1'  => [ '3.3' ],
			'3.4'  => [ '3.4' ],
			'3.5'  => [ '3.5' ],
			'3.6'  => [ '3.6' ],
		];
	}

	public function new_elementor_versions() {
		return [
			'3.7'  => [ '3.7' ],
			'3.7.1'  => [ '3.7.1' ],
			'3.8'  => [ '3.8' ],
		];
	}

	/**
	 * @param $wordpress_version
	 * @return void
	 */
	private function setup_elementor_version( $wordpress_version ) {
		$kit = Plugin::instance()->kits_manager->get_active_kit();
		update_post_meta( $kit->get_main_id(), '_elementor_version', $wordpress_version );
	}

	/**
	 * @return array[]
	 */
	private function setup_basic_configuration() {
		return [
			Default_Typography_Type::PRIMARY => $this->build_basic_primary_configuration(),
			Default_Typography_Type::SECONDARY => $this->build_basic_secondary_configuration(),
			Default_Typography_Type::TEXT => $this->build_basic_text_configuration(),
			Default_Typography_Type::ACCENT => $this->build_basic_accent_configuration(),
		];
	}

	/**
	 * @return array
	 */
	private function setup_3_7_configuration() {
		return [
			Default_Typography_Type::PRIMARY => array_merge( $this->expected_default_configuration[ Default_Typography_Type::PRIMARY ], $this->build_3_7_primary_configuration() ),
			Default_Typography_Type::SECONDARY => array_merge( $this->expected_default_configuration[ Default_Typography_Type::SECONDARY ], $this->build_3_7_secondary_configuration() ),
			Default_Typography_Type::TEXT => array_merge( $this->expected_default_configuration[ Default_Typography_Type::TEXT ], $this->build_3_7_text_or_accent_configuration() ),
			Default_Typography_Type::ACCENT => array_merge( $this->expected_default_configuration[ Default_Typography_Type::ACCENT ], $this->build_3_7_text_or_accent_configuration() ),
		];
	}

	/**
	 * @return array
	 */
	private function build_basic_primary_configuration() {
		return array_merge(
			$this->build_basic_common_values( Default_Typography_Type::PRIMARY ),
			$this->build_responsive_configuration( Typography_Control_Type::FONT_FAMILY, 'Roboto', 'Roboto', 'Roboto' ),
			$this->build_responsive_configuration( Typography_Control_Type::FONT_WEIGHT, '600', '600', '600' )
		);
	}


	private function build_basic_secondary_configuration() {
		return array_merge(
			$this->build_basic_common_values( Default_Typography_Type::SECONDARY ),
			$this->build_responsive_configuration( Typography_Control_Type::FONT_FAMILY, 'Roboto Slab', 'Roboto Slab', 'Roboto Slab' ),
			$this->build_responsive_configuration( Typography_Control_Type::FONT_WEIGHT, '400', '400', '400' )
		);
	}

	private function build_basic_text_configuration() {
		return array_merge(
			$this->build_basic_common_values( Default_Typography_Type::TEXT ),
			$this->build_responsive_configuration( Typography_Control_Type::FONT_FAMILY, 'Roboto', 'Roboto', 'Roboto' ),
			$this->build_responsive_configuration( Typography_Control_Type::FONT_WEIGHT, '400', '400', '400' )
		);
	}

	private function build_basic_accent_configuration() {
		return array_merge(
			$this->build_basic_common_values( Default_Typography_Type::ACCENT ),
			$this->build_responsive_configuration( Typography_Control_Type::FONT_FAMILY, 'Roboto', 'Roboto', 'Roboto' ),
			$this->build_responsive_configuration( Typography_Control_Type::FONT_WEIGHT, '500', '500', '500' )
		);
	}

	private function build_3_7_primary_configuration() {

		return array_merge(
			$this->build_responsive_configuration( Typography_Control_Type::FONT_SIZE, $this->size_40_px, $this->size_40_px, $this->size_40_px ),
			$this->build_responsive_configuration( Typography_Control_Type::TEXT_DECORATION, 'none', 'none', 'none' ),
			$this->build_responsive_configuration( Typography_Control_Type::FONT_STYLE, 'normal', 'normal', 'normal' ),
			$this->build_responsive_configuration( Typography_Control_Type::TEXT_TRANSFORM, 'none', 'none', 'none' ),
			$this->build_responsive_configuration( Typography_Control_Type::LINE_HEIGHT, $this->size_40_px, $this->size_40_px, $this->size_40_px ),
			$this->build_responsive_configuration( Typography_Control_Type::WORD_SPACING, $this->size_0_px, $this->size_0_px, $this->size_0_px ),
			$this->build_responsive_configuration( Typography_Control_Type::LETTER_SPACING, $this->size_0_px, $this->size_0_px, $this->size_0_px )
		);
	}

	/**
	 * @return array
	 */
	private function build_3_7_secondary_configuration() {
		return array_merge(
			$this->build_responsive_configuration( Typography_Control_Type::FONT_SIZE, $this->size_30_px, $this->size_30_px, $this->size_30_px ),
			$this->build_responsive_configuration( Typography_Control_Type::TEXT_DECORATION, 'none', 'none', 'none' ),
			$this->build_responsive_configuration( Typography_Control_Type::FONT_STYLE, 'normal', 'normal', 'normal' ),
			$this->build_responsive_configuration( Typography_Control_Type::TEXT_TRANSFORM, 'none', 'none', 'none' ),
			$this->build_responsive_configuration( Typography_Control_Type::LINE_HEIGHT, $this->size_30_px, $this->size_30_px, $this->size_30_px ),
			$this->build_responsive_configuration( Typography_Control_Type::WORD_SPACING, $this->size_0_px, $this->size_0_px, $this->size_0_px ),
			$this->build_responsive_configuration( Typography_Control_Type::LETTER_SPACING, $this->size_0_px, $this->size_0_px, $this->size_0_px )
		);
	}

	/**
	 * @return array
	 */
	private function build_3_7_text_or_accent_configuration() {
		return array_merge(
			$this->build_responsive_configuration( Typography_Control_Type::FONT_SIZE, $this->size_16_px, $this->size_16_px, $this->size_16_px ),
			$this->build_responsive_configuration( Typography_Control_Type::TEXT_DECORATION, 'none', 'none', 'none' ),
			$this->build_responsive_configuration( Typography_Control_Type::FONT_STYLE, 'normal', 'normal', 'normal' ),
			$this->build_responsive_configuration( Typography_Control_Type::TEXT_TRANSFORM, 'none', 'none', 'none' ),
			$this->build_responsive_configuration( Typography_Control_Type::LINE_HEIGHT, $this->size_16_px, $this->size_16_px, $this->size_16_px ),
			$this->build_responsive_configuration( Typography_Control_Type::WORD_SPACING, $this->size_0_px, $this->size_0_px, $this->size_0_px ),
			$this->build_responsive_configuration( Typography_Control_Type::LETTER_SPACING, $this->size_0_px, $this->size_0_px, $this->size_0_px )
		);
	}

	private function build_responsive_configuration( $key, $desktop_value, $tablet_value, $mobile_value ) {
		return [
			$key => $desktop_value,
			$key . '_' . Breakpoints_Manager::BREAKPOINT_KEY_TABLET => $tablet_value,
			$key . '_' . Breakpoints_Manager::BREAKPOINT_KEY_MOBILE => $mobile_value,
		];
	}

	private function size_to_px_array( $size ) {
		return [
			'size' => $size,
			'unit' => 'px',
		];
	}

	/**
	 * @return array
	 */
	private function build_basic_common_values( $default_typography_type ) {
		return [
			'_id' => $default_typography_type,
			'title' => ucfirst( $default_typography_type ),
			$this->typography_key => 'custom',
		];
	}

}
