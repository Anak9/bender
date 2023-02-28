const removeAlerts = () => {
  // remove error CARD
  if (document.querySelector('.invalid-form-entry')) {
    document.querySelector('.invalid-form-entry').remove();
  }

  // remove error CLASS
  [
    'name',
    'email',
    'password',
    'bending',
    'passwordConfirm',
    'new-password',
  ].forEach((id) => {
    if (document.getElementById(id))
      document.getElementById(id).classList.remove('invalid-entry');
  });
};

// // create error HTML CARD ELEMENT
const createErrorCard = (message, container) => {
  const card = document.createElement('div');

  card.classList = 'invalid-form-entry';

  card.innerHTML = `
    <span class='material-symbols-outlined'> error </span>
    <h3> ${message} </h3>
  `;

  container.insertBefore(card, container.firstChild.nextSibling);
};

// GET INVALID INPUT FIELD
const getField = (message) => {
  if (message.endsWith('same')) return 'passwordConfirm';
  if (message.startsWith('Duplicate')) return 'email';
  if (message.endsWith('characters')) return 'password';
  if (message.endsWith('new password')) return 'new-password';
  if (message.endsWith('confirm your password')) return 'passwordConfirm';

  return message.split(' ').slice(-1);
};

const getMessage = (message) => {
  if (!message.split('.')[1]) return message;
  return message.split('.')[1];
};

export const showError = (message, type) => {
  // clean past error messages
  removeAlerts();

  let container;
  switch (type) {
    case 'login':
    case 'signup':
      container = document.querySelector('.signup-login-container');
      break;

    case 'passwordUpdate':
      container = document.getElementById('user-password-form').firstChild;
      break;

    case 'settingsUpdate':
      container = document.getElementById('user-settings-form').firstChild;
      break;
  }

  if (!(message === 'Invalid email or password'))
    if (message.endsWith('characters') && type === 'passwordUpdate')
      document.getElementById('new-password').classList.add('invalid-entry');
    else if (message.endsWith('same')) {
      document.getElementById('password').classList.add('invalid-entry');
      document.getElementById('passwordConfirm').classList.add('invalid-entry');
    } else
      document.getElementById(getField(message)).classList.add('invalid-entry');

  createErrorCard(getMessage(message), container);
};
