import axios from 'axios';
import { showError } from './alertMsg';

export const changeUserSettings = async (data) => {
  try {
    const result = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updateMe',
      data,
    });

    if (result.data.status === 'success') {
      window.location.assign('/me');
    }
  } catch (err) {
    console.log(err);
    showError(err.response.data.message, 'settingsUpdate');
  }
};

export const changeUserPassword = async (
  newPassword,
  passwordConfirm,
  password
) => {
  try {
    const result = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updateMyPassword',
      data: {
        password,
        newPassword,
        passwordConfirm,
      },
    });

    if (result.data.status === 'success') {
      window.location.assign('/me');
    }
  } catch (err) {
    console.log(err);
    showError(err.response.data.message, 'passwordUpdate');
  }
};
