beforeEach(() => {
  document.body.innerHTML = '';

  if (window.localStorage) {
    window.localStorage.clear();
  }
  if (window.sessionStorage) {
    window.sessionStorage.clear();
  }
});

export function createForm(html) {
  const container = document.createElement('div');
  container.innerHTML = html.trim();
  const form = container.querySelector('form');
  if (!form) {
    throw new Error('createForm: no <form> element found in provided HTML');
  }
  document.body.appendChild(form);
  return form;
}
