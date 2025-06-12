export async function action({ context, request }) {

  const body = await request.text();
  const { email, password, loginStatus, customerAccessToken } = JSON.parse(body);

  console.log('Loader called with email:', email, 'and password:', password, 'loginStatus:', loginStatus, 'customerAccessToken:', customerAccessToken);


//   const CUSTOMER_LOGIN_MUTATION = `#graphql
//     mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
//       customerAccessTokenCreate(input: $input) {
//         customerAccessToken {
//           accessToken
//           expiresAt
//         }
//         customerUserErrors {
//           field
//           message
//         }
//       }
//     }
//   `;

//   const data = await context.storefront.mutate(CUSTOMER_LOGIN_MUTATION, {
//     variables: {
//       input: { email, password },
//     },
//   });

//   const { customerAccessToken, customerUserErrors } = data?.customerAccessTokenCreate || {};

//   if (customerUserErrors?.length) {
//     return Response.json({ error: "Invalid credentials" }, { status: 400 });
//   }

  const session = await context.session;
  session.set('customerAccessToken', customerAccessToken.accessToken);

  context.customerAccount.login = customerAccessToken.accessToken;

  context.customerAccount.isLoggedIn = async () => {
    return loginStatus;
  };

  const loggedIn = await context.customerAccount.isLoggedIn();

  return Response.json({ success: true, messsage: "i am message", customerAccessToken, context, loggedIn });
}   