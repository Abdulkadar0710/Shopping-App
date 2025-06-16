import { getCustomerAccessToken } from "~/lib/auth";


export async function action({ context, request }) {  
//   const url = new URL(request.url);
  // TODO: Replace with dynamic customer access token retrieval
//   const customerAccessToken = '5ccb00a6ce180d7b892f57cce0124e5d'; 
   
//    const req = await request.json();

  
   const body = await request.json();

   const { customerAccessToken } = body;

   console.log("customerAccessToken:, ", customerAccessToken);

  

  if (!customerAccessToken) {
    return Response.json({ error: 'Missing customer access token' }, { status: 401 }); // 401 for unauthorized
  }

  const QUERY = `#graphql
    query GetCustomerWishlist($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        metafield(namespace: "custom", key: "wishl") {
          value 
        }
      }
    }
  `;  

  const response = await context.storefront.query(QUERY, { 
    variables: { customerAccessToken },
  });




const wishlistIds = response?.customer?.metafield?.value
    ? JSON.parse(response.customer.metafield.value)
    : [];

    let ids = wishlistIds.map((item) => item.id);

    console.log("ids: ", ids);


    // const language = url.searchParams.get('lang');
    // console.log("Language: ", language);

    // let lang = 'en';
    // let country = 'US';
    // if (language === 'fr') {
    //   lang = 'FR';
    //   country = 'FR';
    // } else if (language === 'hi') {
    //   lang = 'HI';
    //   country = 'IN';
    // } else {
    //   lang = 'EN';
    //   country = 'US';
    // }

    const PRODUCT_QUERY = `#graphql
  query GetProducts($ids: [ID!]!, $language: LanguageCode, $country: CountryCode) 
  @inContext(language: $language, country: $country) { 
    nodes(ids: $ids) { 
      ... on Product { 
        id
        title
        description
        handle
        vendor
        images(first: 1) {
          edges {
            node {
              url
              altText
            } 
          }
        }
        variants(first: 1) {
          edges {
            node {
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;

    const productResponse = await context.storefront.query(PRODUCT_QUERY, {
      variables: {
        ids,
        language: 'EN',
        country: 'US',
      },
    });

    console.log("productResponse: ", productResponse);

  const productData = productResponse.nodes.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      handle: product.handle,
      vendor: product.vendor,
      image:  product.images?.edges[0]?.node?.url,
    
      price: product.variants?.edges[0]?.node?.price.amount || '0.00'
  }));

  return Response.json(productData);
}
   