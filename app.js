
const totalSources = document.getElementById("totalSources");
const totalPosts = document.getElementById("totalPosts");
const facebookSources = document.getElementById("facebookSources");
const xSources = document.getElementById("xSources");

const postList = document.getElementById("postList");

// Initial dashboard data
let sources = [];
let posts = [];

// Update dashboard statistics
function updateDashboard() {

  totalSources.textContent = sources.length;

  totalPosts.textContent = posts.length;

  facebookSources.textContent = sources.filter(
    source => source.platform === "facebook"
  ).length;

  xSources.textContent = sources.filter(
    source => source.platform === "x"
  ).length;

}

// Render recent posts
function renderPosts() {

  if (posts.length === 0) {

    postList.innerHTML = `
      <p>No posts detected yet.</p>
      <small>Your monitored posts will appear here.</small>
    `;

    return;

  }

  postList.innerHTML = posts.map(post => `
    <div class="platform-card">
      <h3>${post.platform}</h3>
      <p>${post.text}</p>
      <small>${post.date}</small>
    </div>
  `).join("");

}

// Initial render
updateDashboard();
renderPosts();

console.log("Social Media Monitor initialized successfully.");
    
