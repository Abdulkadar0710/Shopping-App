import {useLoaderData, useRouteLoaderData} from 'react-router';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { useEffect, useState } from 'react';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);


  const customerAccessToken = args.context.session.get('customerAccessToken');
  // console.log("customerAccessTokensss: ", customerAccessToken);


  const query = `
    query GetCustomerId($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id  
      }
    }
  `;

  const variables = {
    customerAccessToken,
  };
 
  const response = await args.context.storefront.query(query, {variables});


  return {...deferredData, ...criticalData, customerId: response?.customer?.id, customerAccessToken: customerAccessToken};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
} 

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context, params}) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product} = useLoaderData();

  const data = useLoaderData();
  console.log("Product data: ", data);


  const { customerId } = data;
  const { customerAccessToken } = data;

  const [flag, setFlag] = useState(true);


  const [currentProduct, setCurrentProduct] = useState(product);

  const productToSave = {
    id: currentProduct.id,   
    title: currentProduct.title,
    vendor: currentProduct.vendor,  
    description: currentProduct.description,
    handle: currentProduct.handle,
    image: currentProduct.selectedOrFirstAvailableVariant.image.url,
    price: currentProduct.selectedOrFirstAvailableVariant.price.amount,
  };



  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;





  useEffect(() => {
    const fetchWishList = async () => {
      try {
        console.log("Product to save: ", productToSave);
        const response = await fetch('/fetchWishList', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ customerAccessToken })
        });
  
        let data = await response.json();
        // data =  data.customer?.metafield?.value ? JSON.parse(data.customer?.metafield?.value) : [];
  
        const foundItem = data.find((item) => item.id === product.id);
        console.log("foundItem: ", foundItem);
        setFlag(foundItem ? false : true);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };
   
    fetchWishList();

  
    // // If you had a cleanup, return it here:
    // return () => {
    //   // any necessary cleanup (nothing in your case)
    // };
  }, []);





  const addToCart = async () => {


    const response = await fetch('/fetchWishList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'},
        body: JSON.stringify({ customerAccessToken }),
      },
    );
   
    let data = await response.json();
    console.log("data: ", data);
    // data =  data ? JSON.parse(data) : [];

    console.log("flag: ",flag);
     if(flag){
       data.push(productToSave);
      //  console.log("Adding to wishlist", data);

      const updatedResponse = await fetch('/addToWishList', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({wishlist: data, customerId: customerId}),
      });
      const updatedData = await updatedResponse.json();
      // console.log('updated Wishlist added one:', updatedData);
    }
      else{
        // console.log('Before Updated Wishlist:', data);
        // console.log("productToSave: ",productToSave);
        data = data.filter((item) => item.id !== productToSave.id);
        // console.log('Updated Wishlist:', data);
        const updatedResponse = await fetch('/addToWishList', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', 
          },
          body: JSON.stringify({wishlist: data, customerId: customerId}),
        });
        const updatedData = await updatedResponse.json();
        // console.log('updated Wishlist cutdown:', updatedData);
      }
      setFlag(!flag);
  };    


  useEffect(() => { 
    console.log("floag: ",flag);
  }, [flag]);



  return (
    <div className="product container mx-auto p-4 md:p-8 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <div className="product-image grid ">
          <ProductImage
            image={selectedVariant?.image}
            className="rounded-lg shadow-lg"
            // style={{ height: '90vh', objectFit: 'cover' }}
          />   
        </div>
        <div className="product-main space-y-8">
          <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
            className="text-2xl text-gray-600"
          />
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
            className="space-y-6"
          />
          <div className="addToCart"
           onClick={addToCart}
        >{ flag==true ? <div className="flex justify-start items-center"><CiHeart className="text-2xl mr-2" /> add to WishList </div> : <div className="flex justify-start items-center"><FaHeart className="text-2xl mr-2" /> added to WishList</div>}</div>
          <div>
            <p className="text-lg font-semibold text-gray-700">Description</p>
            <div
              className="mt-4 text-gray-600 text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
        </div>
      </div>
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
