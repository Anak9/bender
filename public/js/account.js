import { changeUserSettings, changeUserPassword } from './userSettings';

export const initAccountEvents = (settingsForm, passwordForm) => {
  // CHANGE NAME and EMAIL and PHOTO
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('photo', document.getElementById('photo').files[0]);

    await changeUserSettings(formData);
  });

  // preview image
  const uploadedImg = document.getElementById('photo');
  uploadedImg.addEventListener('change', () => {
    const file = uploadedImg.files[0];
    document.querySelector('.edit-image-card').style = 'display: flex';
    document.getElementById('edit-photo').src = URL.createObjectURL(file);

    const blanket = document.createElement('div');
    blanket.classList = 'blanket';
    document.querySelector('body').appendChild(blanket);
    document.querySelector('html').style = 'overflow: hidden';

    // cancel change image
    document
      .getElementById('close-edit-photo')
      .addEventListener('click', () => {
        uploadedImg.value = null;
        document.querySelector('.edit-image-card').style = 'display: none';
        document.querySelector('body').removeChild(blanket);
        document.querySelector('html').style = 'overflow: auto';
      });
  });

  // CHANGE PASSWORD
  passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const newPassword = document.getElementById('new-password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    changeUserPassword(newPassword, passwordConfirm, password);
  });
};
