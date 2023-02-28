/* eslint-disable */
// import '@babel/polyfill';
import { initEvents } from './accoun';
import { login, logout, signup } from './login';

// get DOM ELEMENTS
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutBtn = document.getElementById('logout');
const settingsForm = document.getElementById('user-settings-form');
const passwordForm = document.getElementById('user-password-form');

// DELEGATE TASKS

// LOGIN
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

// SIGNUP
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const fields = Object.fromEntries(formData);
    signup(fields);
  });

  // add styles //////////// change?
  const body = document.querySelector('body');
  document.querySelector('.bending').addEventListener('click', (e) => {
    if (e.target.value) {
      body.className = e.target.value;
    }
  });
}

// LOGOUT
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    logout();
  });
}

// UPDATE USER DATA
if (settingsForm) {
  initEvents(settingsForm, passwordForm);
}