import { Amplify } from 'aws-amplify';

const awsconfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-2_cybudQPa1',
      userPoolClientId: '30jg66cktdu7htb5lml1i8pvkb',
      loginWith: {
        oauth: {
          domain: 'us-east-2cybudqpa1.auth.us-east-2.amazoncognito.com',
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: ['http://localhost:5173/'],
          redirectSignOut: ['http://localhost:5173/'],
          responseType: 'code',
        }
      }
    }
  }
};



export default awsconfig;
