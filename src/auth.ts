
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import url from 'url';
import envVariables from '../env-variables';
import keytar from 'keytar';
import os from 'os';

const redirectUri = 'http://localhost/callback';

const keytarService = 'electron-openid-oauth';
const keytarAccount = os.userInfo().username;

let refreshToken = null;

function getAccessToken() {
  return accessToken;
}

function getProfile() {
  return profile;
}

function getAuthenticationURL(authDomain: string, clientId: string, redirectUri: string) {
    return (
      "https://" +
      authDomain +
      "/authorize?" +
      "scope=openid profile offline_access&" +
      "response_type=code&" +
      "client_id=" +
      clientId +
      "&" +
      "redirect_uri=" +
      redirectUri
    );
  }
  
  async function refreshTokens(clientId: string, authDomain: string, ) {
    let accessToken = null;
    let profile = null;
    const refreshToken = await keytar.getPassword(keytarService, keytarAccount);
  
    if (refreshToken) {
      const refreshOptions = {
        method: 'POST',
        url: `https://${authDomain}/oauth/token`,
        headers: {'content-type': 'application/json'},
        data: {
          grant_type: 'refresh_token',
          client_id: clientId,
          refresh_token: refreshToken,
        }
      };
  
      try {
        const response = await axios(refreshOptions);
  
        accessToken = response.data.access_token;
        profile = jwtDecode(response.data.id_token);
      } catch (error) {
        await logout();
  
        throw error;
      }
    } else {
      throw new Error("No available refresh token.");
    }
  }
  
  async function loadTokens(callbackURL: string, clientId: string) {
    const urlParts = url.parse(callbackURL, true);
    const query = urlParts.query;
  
    const exchangeOptions = {
      'grant_type': 'authorization_code',
      'client_id': clientId,
      'code': query.code,
      'redirect_uri': redirectUri,
    };
  
    const options = {
      method: 'POST',
      url: `https://${auth0Domain}/oauth/token`,
      headers: {
        'content-type': 'application/json'
      },
      data: JSON.stringify(exchangeOptions),
    };
  
    try {
      const response = await axios(options);
  
      accessToken = response.data.access_token;
      profile = jwtDecode(response.data.id_token);
      refreshToken = response.data.refresh_token;
  
      if (refreshToken) {
        await keytar.setPassword(keytarService, keytarAccount, refreshToken);
      }
    } catch (error) {
      await logout();
  
      throw error;
    }
  }
  
  async function logout() {
    await keytar.deletePassword(keytarService, keytarAccount);
    accessToken = null;
    profile = null;
    refreshToken = null;
  }
  
  function getLogOutUrl() {
    return `https://${auth0Domain}/v2/logout`;
  }
