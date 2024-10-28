import { useCallback, useEffect, useMemo, useState } from 'react';
import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import View from '../../components/view';
import ImageForm from '../../components/image-form';
import { useEditImage } from '../../context/edit-image-context';
import usePromptSettings, { IMAGE_BACKGROUND_COLOR, IMAGE_RATIO } from '../../hooks/use-prompt-settings';
import { useRequestIds } from '../../../../context/requests-ids';
import ImageRatioSelect from '../../components/image-ratio-select';
import ColorInput from '../../components/color-picker';
import GenerateAgainSubmit from '../../components/generate-again-submit';
import GenerateSubmit from '../../components/generate-submit';
import ImagesDisplay from '../../components/images-display';
import ProductImage from './components/product-image';
import ImageActions from '../../components/image-actions';
import useImageActions from '../../hooks/use-image-actions';

const ProductImageUnification = () => {
	const { setGenerate } = useRequestIds();
	const { editImage: products } = useEditImage();
	const { settings, updateSettings } = usePromptSettings( );
	const [ productsData, setProductsData ] = useState( {} );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState( '' );
	const [ wasGeneratedOnce, setWasGeneratedOnce ] = useState( false );
	const { useMultipleImages } = useImageActions();
	const [ isSavingImages, setIsSavingImages ] = useState( false );
	const use = useCallback( async () => {
		setIsSavingImages( true );
		const imagesToSave = Object.values( productsData )
			.filter( ( product ) => product.data?.isChecked && product.data?.productId !== undefined )
			.map( ( product ) => ( {
				...product.data,
				editor_post_id: product.data.productId,
				unique_id: `ai-product-unification-${ product.data.productId }`,
			} ) );
		// eslint-disable-next-line react-hooks/rules-of-hooks
		await useMultipleImages( imagesToSave );
	}, [ productsData, setIsSavingImages, useMultipleImages ] );
	const generatedAspectRatio = useMemo( () => settings[ IMAGE_RATIO ], [ settings ] );
	const generatedBgColor = useMemo( () => settings[ IMAGE_BACKGROUND_COLOR ], [ settings ] );
	const onProductUpdate = useCallback( ( res, isLoadingResult, errorGenerating, req, productId, ratio, bgColor, image ) => {
		setProductsData( ( prevState ) => ( { ...prevState, [ productId ]: {
			productId,
			res,
			errorGenerating,
			req: ( () => req( {
				postId: productId,
				settings: {
					[ IMAGE_RATIO ]: ratio,
					[ IMAGE_BACKGROUND_COLOR ]: bgColor,
				},
				image,
			} ) ),
			data: {
				productId,
				...( ! errorGenerating ? res?.result?.[ 0 ] ?? image : {} ),
				seed: productId,
				isChecked: prevState?.data?.isChecked ?? true,
				isLoading: isLoadingResult,
			} } } ) );
	}, [] );
	const errorlessProducts = Object.values( productsData ).filter( ( product ) => ! product.errorGenerating );

	const handleSubmit = ( event ) => {
		event.preventDefault();
		setGenerate();
		setWasGeneratedOnce( true );
		errorlessProducts.filter( ( product ) => product.data?.isChecked && product.req )
			.forEach( ( product ) => product.req() );
	};

	useEffect( () => {
		if ( ! errorlessProducts.length ) {
			return;
		}

		const newIsLoading = errorlessProducts.some( ( { data } ) => data?.isLoadingResult );
		const isError = Object.values( productsData ).every( ( { errorGenerating } ) => errorGenerating );

		setIsLoading( newIsLoading );

		setError( ( prevError ) => {
			if ( isError ) {
				return Object.values( productsData )[ 0 ].errorGenerating;
			}
			return prevError;
		} );
	}, [ productsData ] );

	const getCols = ( dataLength = 1 ) => {
		return Math.min( Math.ceil( Math.sqrt( dataLength ?? 1 ) ), 4 );
	};

	return (
		<View>
			<View.Panel>
				<View.PanelHeading
					primary={ __( 'Unify images', 'elementor' ) }
					secondary={ __( 'Select a set of parameters and AI will automate your adjustments:', 'elementor' ) }
				/>
				{ error && <View.ErrorMessage error={ error } onRetry={ handleSubmit } /> }
				<ImageForm onSubmit={ handleSubmit }>
					<Stack gap={ 2 } sx={ { my: 2.5 } }>
						<ColorInput
							label={ __( 'Background Color', 'elementor' ) }
							color={ generatedBgColor }
							onChange={ ( color ) => updateSettings( { [ IMAGE_BACKGROUND_COLOR ]: color } ) }
							disabled={ isLoading }
						/>
						<ImageRatioSelect
							disabled={ isLoading }
							value={ generatedAspectRatio }
							onChange={ ( event ) => updateSettings( { [ IMAGE_RATIO ]: event.target.value } ) }
						/>
						<Stack gap={ 2 } sx={ { my: 2.5 } }>
							{
								wasGeneratedOnce ? (
									<GenerateAgainSubmit disabled={ isLoading } />
								) : (
									<GenerateSubmit disabled={ isLoading } />
								)
							}
						</Stack>
					</Stack>

				</ImageForm>
			</View.Panel>
			<View.Content isGenerating={ isSavingImages }>
				<ImagesDisplay
					images={ errorlessProducts.map( ( product ) => product.data ) }
					cols={ getCols( errorlessProducts.length ?? 1 ) }
					overlay={ false }
					onSelectChange={ ( productId, isChecked ) => setProductsData( ( prevState ) => {
						if ( prevState[ productId ]?.data ) {
							prevState[ productId ].data.isChecked = isChecked;
						}
						return { ...prevState };
					} ) }
				/>
				{ wasGeneratedOnce && ! error && errorlessProducts.length &&
					<ImageActions.UseImage onClick={ use } />
				}
			</View.Content>
			{ products.images
				?.filter( ( img ) => img.productId )
				.map( ( img ) => <ProductImage key={ `product-${ img.productId }` }
					productId={ img.productId }
					ratio={ settings[ IMAGE_RATIO ] }
					bgColor={ settings[ IMAGE_BACKGROUND_COLOR ] }
					image={ img }
					onUpdate={ onProductUpdate } /> ) }
		</View>
	);
};

export default ProductImageUnification;
