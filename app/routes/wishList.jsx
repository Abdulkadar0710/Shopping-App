
import { Link, useLoaderData } from 'react-router';

import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { useEffect, useState } from 'react';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import { getCustomerAccessToken } from '~/lib/auth';
// import i18n from '~/i18n';
// import { useTranslation } from 'react-i18next';


// export async function loader({ context, request }) {

//     // const customerAccessToken = 'd548fdd18770d5de6ef62ec37bc62246';

    
//   const query = `
//     query GetCustomerId($customerAccessToken: String!) {
//       customer(customerAccessToken: $customerAccessToken) {
//         id  
//       }
//     }
//   `;

//   const variables = {
//     customerAccessToken,
//   };

//   const cart = await context.cart.get();
 
//   const response = await context.storefront.query(query, {variables});
//   // console.log("Context: ", context);
//   return json({customerId: response?.customer?.id, contextCart: cart});

// }

export async function loader({ context, request }) {
  
  const customerAccessToken = await getCustomerAccessToken(context);
  
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

const cart = await context.cart.get();

const response = await context.storefront.query(query, {variables});
// console.log("Context: ", context);
return Response.json({customerId: response?.customer?.id, contextCart: cart, customerAccessToken: customerAccessToken});
}




export default function WishList() {

  const {open} = useAside();

  const { customerId } = useLoaderData();
  const { customerAccessToken } = useLoaderData();


  const [wishlist, setWishlist] = useState([]);
  const [otherWishList, setOtherWishList] = useState([]);
  const [flag, setFlag] = useState(true);
  const [wishIds, setWishIds] = useState([]);
 
  const loadWishList = async () => {         
    const response = await fetch(`/fetchWishList`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'},
        body: JSON.stringify({ customerAccessToken }), // Replace with actual customer access token
    });

    let data = await response.json();
    // data = JSON.parse(data.customer?.metafield?.value) || [];

    return data;
  }

  useEffect(()=>{
    const data = loadWishList();
    console.log("Wishlist Data: ", data);
    setWishlist(data || []);
  },[])


  const fetchWishList = async () => {
    const response = await fetch(`/fetchWishList`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'},
        body: JSON.stringify({ customerAccessToken: 'd548fdd18770d5de6ef62ec37bc62246' }), // Replace with actual customer access token
    });
    let data = await response.json();
    // data = JSON.parse(data.customer?.metafield?.value) || [];
    setWishlist(data || []);
    // console.log('Fetched Wishlist:', data);
  };

  const removeFronCart = async (id) => { 

    // console.log("Removing item with ID:", id);
    // console.log("Wishlist before removal:", wishlist);
   
    const updatedWishlist = wishlist.filter(item => item.id !== id);
    // console.log("Wishlist After removal:", updatedWishlist);

        const updatedResponse = await fetch('/addToWishList', { 
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json',  
          }, 
          body: JSON.stringify({wishlist: updatedWishlist, customerId: customerId}),
        });
        const updatedData = await updatedResponse.json();

    setWishlist(updatedWishlist);

  }
  
 
  useEffect(() => {
    fetchWishList();
  }, []);


// const fetchDataFromUrl = async () => {
//   const res = await fetch(`/fetchProductsInfoById?id=8649199812836`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       'X-Shopify-Access-Token': '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', // Fix env reference
//     }, 
//   });


//   const data = await res.json();
//   setOtherWishList(data);
//   return data;
// }

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const data = await fetchDataFromUrl();
//         // console.log("Fetched Data: ", data);
//       } catch (error) {
//         console.error("Error fetching data: ", error);
//       } 
//     }; 

//     fetchData();
//   }
//   , []);



  const getProductId = (id) => {
   const productId = id.split('/').pop();
  //  console.log("Product ID: ", productId);
   return productId;
  }
   
//   const { i18n } = useTranslation();
//   console.log("Current Language: ", i18n.language);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Wishlist</h2>
      {wishlist.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => (
        <div
          key={item.id}
          className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col"
        >
          <div className="w-full h-48 flex items-center justify-center bg-gray-100">
          <img
            src={item.image}
            alt={item.title}
            className="max-w-full max-h-full object-contain"
          />
          </div>
          <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{item.description}</p>
          <p className="text-lg font-bold text-blue-500 mb-4">{item.price}</p>
          <Link
            to={`/products/${item.handle}`}
            style={{
              textDecoration: 'none'
            }}
            className="mt-auto inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center hover:no-underline"
          >
           <div className="text-white hover:no-underline">View Product</div>
          </Link>
          <button
            className="mt-4 flex items-center justify-center"
            onClick={() => removeFronCart(item.id)}
          >
            {flag ? <FaHeart size={20} /> : <CiHeart size={20} />}
          </button>
          </div>
        </div>
        ))}
      </div>
      ) : (
      <p className="text-center text-gray-500">Your wishlist is empty.</p>
      )}
      {wishlist.length > 0 && (
      <div className="text-center mt-8">
        <Link
        to="/checkout"
        className="inline-block bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600"
        >
        Proceed to Checkout
        </Link>
      </div>
      )}
    </div>
    );
}
