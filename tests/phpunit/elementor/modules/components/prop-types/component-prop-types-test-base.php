<?php
namespace Elementor\Testing\Modules\Components\PropTypes;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Plugin;
use Elementor\Elements_Manager;
use Elementor\Core\Documents_Manager;
use PHPUnit\Framework\MockObject\MockObject;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Image\Atomic_Image;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Button\Atomic_Button;
use Elementor\Testing\Modules\Components\Mocks\Component_Overrides_Mocks;
use Elementor\Modules\Components\Documents\Component;
use Elementor\Modules\Components\Documents\Component_Overridable_Props;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../mocks/component-overrides-mocks.php';

abstract class Component_Prop_Type_Test_Base extends Elementor_Test_Base {
	private Elements_Manager $original_elements_manager;
	private MockObject $elements_manager_mock;

	private Documents_Manager $original_documents_manager;
	private MockObject $documents_manager_mock;

	protected Component_Overrides_Mocks $mocks;


	const VALID_COMPONENT_ID = 123;
	const NON_EXISTENT_COMPONENT_ID = 999;
	public function setUp(): void {
		parent::setUp();
		
		$this->mocks = new Component_Overrides_Mocks();

		$this->mock_elements_manager();
		$this->mock_documents_manager();
	}

	public function tearDown(): void {
		parent::tearDown();

		$this->reset_elements_manager();
		$this->reset_documents_manager();
	}

	public function mock_elements_manager() {
		$this->original_elements_manager = Plugin::$instance->elements_manager;

		$this->elements_manager_mock = $this->getMockBuilder( Elements_Manager::class )->disableOriginalConstructor()->onlyMethods( [ 'get_element' ] )->getMock();

        $this->elements_manager_mock->method( 'get_element' )
            ->willReturnCallback( function ( $el_type, $widget_type = null ) {
                switch ( $widget_type ) {
                    case 'e-heading':
                        return new Atomic_Heading();
					case 'e-image':
						return new Atomic_Image();
					case 'e-button':
						return new Atomic_Button();
                    default:
                        return null;
                }
            } );

        Plugin::$instance->elements_manager = $this->elements_manager_mock;
	}

	public function reset_elements_manager() {
		Plugin::$instance->elements_manager = $this->original_elements_manager;
	}

	public function mock_documents_manager() {
		$this->original_documents_manager = Plugin::$instance->documents;
		$this->documents_manager_mock = $this->getMockBuilder( Documents_Manager::class )
			->disableOriginalConstructor()->onlyMethods( [ 'get' ] )->getMock();

		$this->documents_manager_mock->method( 'get' )
			->willReturnCallback( function ( $post_id ) {
				if ($post_id === self::VALID_COMPONENT_ID) {
					return new Mock_Component_Document( $this->mocks->get_mock_component_overridable_props() );
				}
				return null;
			} );

		Plugin::$instance->documents = $this->documents_manager_mock;
	}

	public function reset_documents_manager() {
		Plugin::$instance->documents = $this->original_documents_manager;
	}
}

class Mock_Component_Document extends Component {
	private ?array $mock_overridable_props = null;

	public function __construct( ?array $overridable_props = null ) {
		$this->mock_overridable_props = $overridable_props;
	}

	public function get_overridable_props(): Component_Overridable_Props {
		return Component_Overridable_Props::make( $this->mock_overridable_props );
	}
}