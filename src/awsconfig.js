import { Amplify } from 'aws-amplify';

const awsconfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_QxNebIuqg',
      userPoolClientId: '50l8q60ecfhg91s9ktg3f30n65',
      loginWith: {
        oauth: {
          domain: 'us-east-1qxnebiuqg.auth.us-east-1.amazoncognito.com',
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
