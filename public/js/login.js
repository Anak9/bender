/* eslint-disable */
import axios from 'axios';
import { showError } from './alertMsg';

// LOG IN
export const login = async (email, password) => {
  try {
    const result = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (result.data.status === 'success') {
      // alert msg success
      window.location.assign('/');
    }
  } catch (err) {
    console.log(err);
    showError(err.response.data.message, 'login');
  }
};

// LOG OUT
export const logout = async () => {
  try {
    const result = await axios('http://127.0.0.1:3000/api/v1/users/logout');
    if (result.data.status === 'success') {
      window.location.assign('/');
    }
  } catch (err) {
    console.log(err);
  }
};

// SIGN UP
export const signup = async (fields) => {
  try {
    const result = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data: {
        name: fields.name,
        email: fields.email,
        bending: fields.bending,
        password: fields.password,
        passwordConfirm: fields.passwordConfirm,
      },
    });

    if (result.data.status === 'success') {
      console.log(result);
      window.location.assign('/');
    }
  } catch (err) {
    console.log(err);
    showError(err.response.data.message, 'signup');
  }
};
