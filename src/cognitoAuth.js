export class CognitoAuth {

  constructor(config) {
      this.config = config;
      AWSCognito.config.region = config.providers.cognito.region;
      this.userPoolId = config.providers.cognito.userPoolId;
      this.appClientId = config.providers.cognito.appClientId;


      // pool data
      this.poolData = {
        UserPoolId: this.userPoolId,
        ClientId: this.appClientId
      };

      this._initialized = false;
      try{
        if(!this._initialized){
          AWSCognito.config.update({accessKeyId: 'mock', secretAccessKey: 'mock'});
          this.userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(this.poolData);
        }
        this._initialized = true;
        // console.log("CognitoAuth initialized")
      } catch(e){
        console.log("Error initializing CognitoAuth")
      }
  }


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
        onSuccess: (result) => resolve(this._normalizeCognitoResponse(result)),
        onFailure: (err) => reject(this._normalizeCognitoResponseError(err))
      });
    });
  }

  _normalizeCognitoResponse(response){
    console.log("_normalizeCognitoResponse - in",response)
    const normalizedResponse = {};
    normalizedResponse.status = "success";
    normalizedResponse[this.config.accessTokenName] = response.accessToken.jwtToken;
    normalizedResponse[this.config.refreshTokenName] = response.refreshToken.jwtToken;
    normalizedResponse[this.config.idTokenName] = response.idToken.jwtToken;
    normalizedResponse.message = null;
    normalizedResponse.otherPossibleAccounts = null;
    normalizedResponse.originalData = null;
    normalizedResponse.oauth_token = response.accessToken.jwtToken;
    return normalizedResponse;
  }

  _normalizeCognitoResponseError(err){
    console.log("error", err.message)
    const normalizedResponse = {};
    normalizedResponse.status = "success";
    normalizedResponse[this.config.accessTokenName] = null;
    normalizedResponse[this.config.refreshTokenName] = null;
    normalizedResponse[this.config.idTokenName] = null;
    normalizedResponse.message = err.message;
    normalizedResponse.otherPossibleAccounts = null;
    normalizedResponse.originalData = null;
    normalizedResponse.oauth_token = null;
    return normalizedResponse;
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

  forgotPassword(username){
    this.initialise();
    let userData = {
      Username: username,
      Pool: this.userPool
    };

    let cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
    return cognitoUser.forgotPassword({
      onSuccess: function (result) {
        console.log('call result: ' + result);
      },
      onFailure: function(err) {
        alert(err);
      },
      //Optional automatic callback
      inputVerificationCode: function(data) {
        console.log('Code sent to: ' + data);
      }
    });
  }


  verificationCode(username, verificationCode, newPassword ){
    this.initialise();
    let userData = {
      Username: username,
      Pool: this.userPool
    };

    let cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
    return new Promise((resolve, reject)=>{
      cognitoUser.confirmPassword(verificationCode, newPassword,
        { onSuccess: (result) =>{
          console.log('call result: ' + result);
          resolve(true)
        },
          onFailure: (err)=> {
            alert(err);
            reject(err)
          }
        })
    });
  }

}
