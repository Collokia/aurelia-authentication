import {inject} from 'aurelia-dependency-injection';
import {BaseConfig}  from './baseConfig';

@inject(BaseConfig)
export class CognitoAuth {

  constructor(config) {
    if (config.cognito) {
      AWSCognito.config.region = 'us-east-1'; //config.cognito.region;
      this.userPoolId = 'us-east-1_aq4x7TaKA'; //config.cognito.userPoolId;
      this.appClientId = 'qjgs33kfvs0en5jk2s2hpva9k'; //config.cognito.appClientId;

      // Required as mock credentials
      AWSCognito.config.update({accessKeyId: 'mock', secretAccessKey: 'mock'});

      // pool data
      this.poolData = {
        UserPoolId: this.userPoolId,
        ClientId: this.appClientId
      };

      // create user pool
      this.userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(this.poolData);
    }
  }

  // userAttributes should be an array of objects like
  // [{
  //   Name: 'email',
  //   Value: 'the@email.com'
  // }]

  registerUser(username, password, userAttributes) {
    let attributes = [];

    // let emailData = {
    //   Name: 'email',
    //   Value: attributes.email
    // };

    attributes = userAttributes.map(it => new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(it));

    return new Promise((resolve, reject)=> {
      this.userPool.signUp(username, password, attributes, null, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }

  confirmUser(username, code) {
    let userData = {
      Username: username,
      Pool: this.userPool
    };

    let cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

    return new Promise((resolve, reject)=> {
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  loginUser(username, password) {
    let authData = {
      Username: username,
      Password: password
    };

    let authDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authData);

    let userData = {
      Username: username,
      Pool: this.userPool
    };

    let cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

    return new Promise((resolve, reject)=> {
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (result) => resolve(result),
        onFailure: (err) => reject(err)
      });
    });
  }

  getSession() {
    let cognitoUser = this.userPool.getCurrentUser();
    return new Promise((resolve, reject)=> {
      if (cognitoUser != null) {
        cognitoUser.getSession((err) => {
          if (err) {
            this.logoutUser();
            reject(err)
            return null;
          }
          resolve(cognitoUser);
        });
      }
      else {
        this.logoutUser();
        resolve(null);
      }
    });
  }

  logoutUser() {
    let cognitoUser = this.userPool.getCurrentUser();
    if (cognitoUser != null){
      cognitoUser.signOut();
    }
  }

  getUserAttributes() {
    return new Promise((resolve, reject) => {
      this.session.user.getUserAttributes((err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
    })
  }
}
