
export async function loader({ context, request }) {
  const session = await context.session;

  // Clear the customer access token from the session
  session.unset('customerAccessToken'); 

  // Optionally, you can also clear other session data related to the customer
  context.customerAccount.isLoggedIn = async () => {
    return false; // User is logged out
  }

 console.log('Logging out user...');

  return Response.json({response: "true"}, {status: 200});
}