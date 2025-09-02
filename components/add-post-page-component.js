import { renderHeaderComponent } from './header-component.js';
import { renderUploadImageComponent } from './upload-image-component.js';

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let imageUrl = '';
  let description = '';

  const render = () => {
    const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <div class="form">
        <h3 class="form-title">Добавить пост</h3>
        <div class="form-inputs">
          <div class="upload-image-container"></div>
          <p class="form-label">Опишите фотографию:</p>
          <textarea 
            id="description-input" 
            class="input" 
            placeholder="Описание поста"
            rows="6"
          ></textarea>
          <div class="form-error"></div>
          <button class="button" id="add-button" disabled>Добавить</button>
        </div>
      </div>
    </div>
  `;

    appEl.innerHTML = appHtml;

    const addButton = document.getElementById('add-button');

    const updateButtonState = () => {
      addButton.disabled = !(description.trim() && imageUrl);
    };

    addButton.addEventListener('click', () => {
      if (description.trim() && imageUrl) {
        addButton.disabled = true;
        onAddPostClick({ description, imageUrl });
      }
    });

    renderHeaderComponent({
      element: document.querySelector('.header-container'),
    });

    const descriptionInput = document.getElementById('description-input');
    descriptionInput.addEventListener('input', (event) => {
      description = event.target.value;
      updateButtonState();
    });

    const uploadImageContainer = appEl.querySelector('.upload-image-container');
    renderUploadImageComponent({
      element: uploadImageContainer,
      onImageUrlChange(newImageUrl) {
        imageUrl = newImageUrl;
        updateButtonState();
      },
    });
  };

  render();
}
