export async function getCustomerAccessToken(context) {
    return await context.session.get('customerAccessToken');
  }