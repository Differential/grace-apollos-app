import { Auth } from '@apollosproject/data-connector-rock';
import { fetch, Request } from 'apollo-server-env';
import { AuthenticationError, UserInputError } from 'apollo-server';

const {
  resolver,
  schema,
  dataSource: AuthDataSource,
  contextMiddleware,
} = Auth;

class dataSource extends AuthDataSource {
  fetchUserCookie = async (Username, Password) => {
    try {
      // We use `new Response` rather than string/options b/c if conforms more closely with ApolloRESTDataSource
      // (makes mocking in tests WAY easier to use `new Request` as an input in both places)
      const response = await fetch(
        new Request(`${this.baseURL}/Auth/Login`, {
          method: 'POST',
          body: JSON.stringify({
            Username,
            Password,
            Persisted: true,
          }),
          headers: {
            'Content-Type': 'Application/Json',
          },
        })
      );
      if (response.status >= 400) throw new AuthenticationError();
      const cookies = response.headers.get('set-cookie');
      const rockCookies = /.ROCK=[a-zA-Z0-9]+;/.exec(cookies);
      console.log(rockCookies[0]);
      return rockCookies[0];
    } catch (err) {
      console.log(err);
      throw new AuthenticationError('Invalid Credentials');
    }
  };
}

export { resolver, schema, dataSource, contextMiddleware };
