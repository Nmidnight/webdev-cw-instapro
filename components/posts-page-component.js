import { USER_POSTS_PAGE } from '../routes.js';
import { renderHeaderComponent } from './header-component.js';
import { posts, goToPage } from '../index.js';
import { formatDate } from '../utilits/format-date.js';
import likeActiveIcon from '../assets/images/like-active.svg';
import likeNotActiveIcon from '../assets/images/like-not-active.svg';
import { likePost, dislikePost, deletePost, getPosts } from '../api.js';
import { getToken, user } from '../index.js';

export function renderPostsPageComponent({ appEl }) {
  // @TODO: сделано

  const renderPosts = posts
    .map((post) => {
      return `
      <li class="post">
        <div class="post-header" data-user-id="${post.user.id}">
          <img src="${post.user.imageUrl}" class="post-header__user-image">
          <p class="post-header__user-name">${post.user.name}</p>
        </div>
        <div class="post-image-container">
          <img class="post-image" src="${post.imageUrl}">
        </div>
        <div class="post-likes" data-post-id="${post.id}">
          <div class="post-likes-left">
          <button class="like-button">
            <img src="${post.isLiked ? likeActiveIcon : likeNotActiveIcon}">
          </button>
          <p class="post-likes-text">
            Нравится: <strong>${post.likes.length}</strong>
          </p>
          </div>
          ${
            String(post.user.id) === String(user?._id)
              ? `<button data-post-id="${post.id}" class="delete-comment-button" title="Удалить пост">
                 Удалить
               </button>`
              : ''
          }
          
        </div>
        <p class="post-text">
          <span class="user-name">${post.user.name}</span> ${post.description}
        </p>
        <p class="post-date">${formatDate(post.createdAt)}</p>
      </li>`;
    })
    .join('');

  /**
   * @TODO: готово
   */
  const appHtml = `
              <div class="page-container">
                <div class="header-container"></div>
                <ul class="posts">
                  ${renderPosts}
                </ul>
              </div>`;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector('.header-container'),
  });
}

document.addEventListener('click', (event) => {
  let token = '';
  let postId = '';
  if (event.target.closest('.like-button')) {
    const likeButton = event.target.closest('.like-button');
    token = getToken();
    postId = event.target.closest('.post-likes').dataset.postId;
    const post = posts.find((p) => p.id === postId);
    if (!token) {
      likeButton.disabled = true;
      return;
    }
    if (post.isLiked) {
      dislikePost({ postId, token }).then((data) => {
        post.isLiked = false;
        post.likes = data.post.likes;
        renderPostsPageComponent({ appEl: document.querySelector('#app') });
      });
    } else {
      likePost({ postId, token }).then((data) => {
        post.isLiked = true;
        post.likes = data.post.likes;
        renderPostsPageComponent({ appEl: document.querySelector('#app') });
      });
    }
  }
  if (event.target.closest('.delete-comment-button')) {
    const deleteCommentButton = event.target.closest('.delete-comment-button');
    token = getToken();
    postId = event.target.closest('.post-likes').dataset.postId;
    if (posts.find((p) => p.id === postId).user.id === user.id) {
      deleteCommentButton.style.display = 'block';
    }
    if (!token) {
      deleteCommentButton.disabled = true;
      return;
    }
    if (confirm('Вы уверены, что хотите удалить этот пост?')) {
      deletePost({ postId, token }).then(() => {
        getPosts({ token }).then((newPosts) => {
          posts.length = 0;
          posts.push(...newPosts);

          renderPostsPageComponent({ appEl: document.querySelector('#app') });
        });
      });
    }
  }
  for (let userEl of document.querySelectorAll('.post-header')) {
    userEl.addEventListener('click', () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }
});
