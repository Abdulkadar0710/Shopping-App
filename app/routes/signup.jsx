import { useEffect } from "react";
import { Form, Link, useActionData } from "react-router";


export async function action({ context, request }) {
  const formData = await request.formData();
const firstName = formData.get("firstName");
const lastName = formData.get("lastName");
const email = formData.get("email");
const password = formData.get("password");

const input = {
    firstName,
    lastName,
    email,
    password,
};

  const CREATE_CUSTOMER_MUTATION = `#graphql
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
        }
        customerUserErrors {
          field
          message
        }
      }
    }
  `;

  const  val = await context.storefront.mutate(CREATE_CUSTOMER_MUTATION, {
    variables: { input },
  });


  const LOGIN_MUTATION = `
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

const loginResponse = await context.storefront.mutate(LOGIN_MUTATION, {
  variables: {
    input: {
      email: input.email,
      password: input.password,
    },
  },
});

  const customerAccessToken = loginResponse?.customerAccessTokenCreate?.customerAccessToken?.accessToken;
    const session = await context.session;
    session.set('customerAccessToken', customerAccessToken.accessToken);

    if (!customerAccessToken) { 
    return Response.json({
      status: "error",
      message: "Failed to create customer or login. Please check your credentials."
    }, { status: 400 });
  }

  context.customerAccount.login = customerAccessToken;
  context.customerAccount.isLoggedIn = async () => {
    return true; // Assuming the user is logged in after successful signup
  };


  return Response.json({
    status: "success",
    customerAccessToken
  });

}

  
export default function Signup() {

    const data = useActionData();
    console.log(data);

    useEffect(() => {
      const customerAccessToken = localStorage.getItem('customerAccessToken');
      if (customerAccessToken) {
        window.location.href = '/'; // Redirect to home if already authenticated
      }
    }, []);

    useEffect(() => {
      if (data?.status === "success") {
        localStorage.setItem("customerAccessToken", data.customerAccessToken);
        document.cookie = `customerAccessToken=${data.customerAccessToken}; path=/; secure; HttpOnly`;
        sessionStorage.setItem("customerAccessToken", data.customerAccessToken);
        window.location.href = "/";
      } else if (data?.status === "error") {
        alert(data.message);
      }
    },[data])
  
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Sign Up</h2>
          <Form method="post" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign Up
            </button>
            <div className="text-center">
              <Link
                to="/login"
                className="text-blue-500 hover:underline"
              >
                Already have an account? Login
              </Link>
            </div>
          </Form>
        </div>
      </div>
    );
  }