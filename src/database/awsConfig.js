// src/database/awsConfig.js
import { Amplify } from 'aws-amplify';

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_AWS_CLIENT_ID,
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1'
    }
  },
  S3: {
    bucket: import.meta.env.VITE_AWS_S3_BUCKET,
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1'
  }
};

Amplify.configure(awsConfig);

export default awsConfig;
