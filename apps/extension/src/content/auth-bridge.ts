// Content script that runs on the Tom Flips web app
// Listens for auth token events and forwards them to the extension background

// Inject extension marker for detection by the web app
(() => {
  const marker = document.createElement('div');
  marker.id = 'tom-flips-extension-marker';
  marker.style.display = 'none';
  marker.setAttribute('data-version', '1.0.0');
  document.documentElement.appendChild(marker);
})();

window.addEventListener('tomflips-auth', ((event: CustomEvent) => {
  const { token, action } = event.detail;

  if (action === 'login' && token) {
    chrome.runtime.sendMessage({ type: 'LOGIN', token });
  } else if (action === 'logout') {
    chrome.runtime.sendMessage({ type: 'LOGOUT' });
  }
}) as EventListener);

// On page load, check if there's already a token in localStorage
// and sync it to the extension
const existingToken = localStorage.getItem('accessToken');
if (existingToken) {
  chrome.runtime.sendMessage({ type: 'LOGIN', token: existingToken });
}
