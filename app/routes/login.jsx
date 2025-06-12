import { useEffect } from "react";
import { Form, Link, useActionData, useLoaderData, useRouteLoaderData } from "react-router";
import { createCookieSessionStorage } from "react-router";
import {getCustomerAccessToken} from '~/lib/auth';

export async function loader({ context }) {
  const customerAccessToken = await getCustomerAccessToken(context);
  console.log("customerAccessToken: ", customerAccessToken);
 return { customerAccessToken };
}

export const action = async ({ request, context }) => {

    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');  

  
    const CUSTOMER_LOGIN_MUTATION = `#graphql
      mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            field
            message
          }
        }
      }
    `;
  
    const  data  = await context.storefront.mutate(CUSTOMER_LOGIN_MUTATION, {
      variables: {
        input: { email, password }, 
      },
    });
  
    const {customerAccessToken, customerUserErrors} = data?.customerAccessTokenCreate || {};
    // console.log('Login data:', {email,password,customerAccessToken, customerUserErrors});
  
    if (customerUserErrors?.length){
      return Response.json({ error: "Invalid" }, { status: 400 });
    }
   
    const session = await context.session;
    session.set('customerAccessToken', customerAccessToken.accessToken);

    context.customerAccount.login = customerAccessToken.accessToken;

    context.customerAccount.isLoggedIn = async () => {
      return true; // Assuming the user is logged in after successful login
    };

    const loggedIn = await context.customerAccount.isLoggedIn();

    // var MyData = "";

    // fetch("http://localhost:3000/loginapi", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ email, password, loginStatus: true, customerAccessToken }),
    // })
    // .then((response) => {
    //  MyData = response.json();
    // }
    // )
    // .catch((error) => {
    //   console.error("Error during login:", error);
    //   return { error: "An error occurred during login." };
    // }
    // );  
  
    return Response.json({ success: true, customerAccessToken : customerAccessToken, context, loggedIn});
  };



export default function Login() {

    const data = useLoaderData();
    // console.log("Loader data: ", data);
    // const routerData = useRouteLoaderData('root');

    useEffect(()=>{
    const customerAccessToken = localStorage.getItem('customerAccessToken');
    if (customerAccessToken) {    

      window.location.href = '/';
    }
    }, [])
 
 
    const actionData = useActionData(); 
   
    console.log("actionData: ", actionData); 
   
    useEffect(()=>{ 
      const error = actionData?.error;
      if(actionData!=null && actionData!='undefined' && !error){ 
      localStorage.setItem('customerAccessToken', actionData?.customerAccessToken.accessToken);

     }
  
      if (actionData?.success) {

        console.log("Login successful, redirecting to home page.");
        window.location.href = '/'; // Redirect to home page
      }
  
    },[actionData]); 
  
  
    return (
      <div className="signup-container flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <Form method="post" className="signup-form bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-sm">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Login
            </button>
            <Link
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              to="/signup"
            >
              Signup
            </Link>
          </div>
        </Form>
      </div>
    );
  }
  