This is our payload:
{
    "type": "html",
    "content": "<div style=\"background: linear-gradient(to right, #ff7e5f, #feb47b); padding: 40px;\"><div style=\"background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-radius: 20px; padding: 30px; margin-bottom: 20px;\"><h2 style=\"color: #2d3748; text-align: center; margin-bottom: 30px;\">Color Variations</h2><div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;\"><div style=\"background: #e53e3e; color: white; padding: 20px; border-radius: 10px; text-align: center;\">Red Background</div><div style=\"background: #38a169; color: white; padding: 20px; border-radius: 10px; text-align: center;\">Green Background</div><div style=\"background: #3182ce; color: white; padding: 20px; border-radius: 10px; text-align: center;\">Blue Background</div><div style=\"background: #805ad5; color: white; padding: 20px; border-radius: 10px; text-align: center;\">Purple Background</div></div></div></div>"
}

Issue 1: 
Gradient incorrect.
Original: 
background: linear-gradient(to right, #ff7e5f, #feb47b);
API version:
background-image: linear-gradient(90deg, #ff7e5f 0%, #feb47b 1%);
Problem: 1% should be 100%.


Issue 2:
It is incorrect duplicating the text strings: 
Color Variations Red Background Green Background Blue Background Purple Background

Red Background Green Background Blue Background Purple Background

<div class="elementor-element elementor-element-ff6c7530-db73-4776-858f-1a400152aa1e e-con e-atomic-element e-div-block-base e-42f37647-b899e59" data-id="ff6c7530-db73-4776-858f-1a400152aa1e" data-element_type="e-div-block">
								<p class="e-paragraph-base">
										Color Variations Red Background Green Background Blue Background Purple Background
						</p>
				<div class="elementor-element elementor-element-fc824c7d-fcca-46f8-b7cf-f2691db8142f e-con e-atomic-element e-div-block-base e-a7f5ea16-f186074" data-id="fc824c7d-fcca-46f8-b7cf-f2691db8142f" data-element_type="e-div-block">
							<h2 class="e-635e42a8-fac3a0c e-heading-base">
			Color Variations
		</h2>
				<div class="elementor-element elementor-element-059dd563-1efd-4653-8e1a-c5d789bdbed2 e-con e-atomic-element e-div-block-base e-97234c3b-39fbea6" data-id="059dd563-1efd-4653-8e1a-c5d789bdbed2" data-element_type="e-div-block">
								<p class="e-paragraph-base">
										Red Background Green Background Blue Background Purple Background
						</p>
				<div class="elementor-element elementor-element-29309f23-f20e-4f15-8cd3-b03c2b2e7b1c e-con e-atomic-element e-div-block-base e-5ebcdd05-4d1abe3" data-id="29309f23-f20e-4f15-8cd3-b03c2b2e7b1c" data-element_type="e-div-block">
								<p class="e-paragraph-base">
										Red Background
						</p>
				</div>
				<div class="elementor-element elementor-element-b9d6e9c2-b29a-41cf-808b-cf0b5b98ef0b e-con e-atomic-element e-div-block-base e-446bac33-6ad0dde" data-id="b9d6e9c2-b29a-41cf-808b-cf0b5b98ef0b" data-element_type="e-div-block">
								<p class="e-paragraph-base">
										Green Background
						</p>
				</div>
				<div class="elementor-element elementor-element-aea1d434-d0f4-4a97-b1cb-83c367d07856 e-con e-atomic-element e-div-block-base e-1bedd4e4-d32bd1d" data-id="aea1d434-d0f4-4a97-b1cb-83c367d07856" data-element_type="e-div-block">
								<p class="e-paragraph-base">
										Blue Background
						</p>
				</div>
				<div class="elementor-element elementor-element-2003fd25-a9ac-4ec2-a6dd-e3c800426ec0 e-con e-atomic-element e-div-block-base e-e54727b8-7077b53" data-id="2003fd25-a9ac-4ec2-a6dd-e3c800426ec0" data-element_type="e-div-block">
								<p class="e-paragraph-base">
										Purple Background
						</p>
				</div>
				</div>
				</div>
				</div>
