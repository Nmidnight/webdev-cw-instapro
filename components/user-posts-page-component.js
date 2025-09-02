import { USER_POSTS_PAGE } from '../routes.js';
import { renderHeaderComponent } from './header-component.js';
import { formatDate } from '../utilits/format-date.js';
import likeActiveIcon from '../assets/images/like-active.svg';
import likeNotActiveIcon from '../assets/images/like-not-active.svg';
import { likePost, dislikePost, deletePost, getUserPosts } from '../api.js';
import { getToken, user, goToPage, posts } from '../index.js';

export function renderUserPostsPageComponent({ appEl, profileUser }) {
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

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <h3 class="form-title">Посты пользователя ${profileUser?.name || ''}</h3>
      <ul class="posts">
        ${renderPosts}
      </ul>
    </div>`;
  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector('.header-container'),
  });

  document.querySelectorAll('.like-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const postId = btn.closest('.post-likes').dataset.postId;
      const token = getToken();
      const post = posts.find((p) => p.id === postId);

      if (!token) return;

      if (post.isLiked) {
        dislikePost({ postId, token }).then((data) => {
          post.isLiked = false;
          post.likes = data.post.likes;
          renderUserPostsPageComponent({ appEl, posts, profileUser });
        });
      } else {
        likePost({ postId, token }).then((data) => {
          post.isLiked = true;
          post.likes = data.post.likes;
          renderUserPostsPageComponent({ appEl, posts, profileUser });
        });
      }
    });
  });

  document.querySelectorAll('.delete-comment-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const postId = btn.dataset.postId;
      const token = getToken();
      if (!token) return;

      if (confirm('Вы уверены, что хотите удалить этот пост?')) {
        deletePost({ postId, token }).then(() => {
          getUserPosts({ token, userId: profileUser.id }).then((data) => {
            renderUserPostsPageComponent({
              appEl,
              posts: data.posts,
              profileUser: data.user,
            });
          });
        });
      }
    });
  });

  document.querySelectorAll('.post-header').forEach((userEl) => {
    userEl.addEventListener('click', () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  });
}
