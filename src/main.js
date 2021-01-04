const TESTING = false;

let currentPage = 1;

let currentSearch = 'Star Wars';

let currentResults = 10;

const moviesList = document.getElementById('movies');
const movieInput = document.getElementById('search');

const pagination = document.getElementById('pagination');

const omdbURL = new URL('https://www.omdbapi.com');
const params = new URLSearchParams();
params.append('apikey', 'ae7826ed');

movieInput.addEventListener('keyup', search);
getMovies();

pagination.addEventListener('click', function (e) {
  console.log(currentPage);
  console.log(currentResults);
  let target = e.target.id;
  if (target === 'prev') {
    if (currentPage > 1) {
      currentPage--;
      getMovies();
    }
  } else if (target === 'next') {
    if (currentPage < getLastPage()) {
      currentPage++;
      getMovies();
    }
  }
});

function getLastPage(){
  return Math.ceil(currentResults / 10);
}

function showMovies(movies) {
  console.log(movies);
  moviesList.innerHTML = movies
    .map(movie => {
      let ratings = movie.Ratings;
      if (ratings.length > 0) {
        rating = `<div class="rating">${ratings[0].Value}</div>`;
      } else {
        rating = '';
      }
      return `<li>
      <img src="${movie.Poster}">
      <div class="info">
        <div class="title">${movie.Title}</div>
        ${rating}
        <div class="plot">${movie.Plot}</div>
      </div>
      </li>`;
    })
    .join('');
}

function getUrlWithParam(options) {
  for (let [name, value] of Object.entries(options)) {
    params.append(name, value);
  }
  omdbURL.search = params;
  let url = omdbURL.href;
  for (let [name, value] of Object.entries(options)) {
    params.delete(name);
  }
  return url;
}

function showPagination() {
  pagination.innerHTML = '';
  let prev = `<button id="prev">Previous</button>`;
  let next = `<button id="next">Next</button>`;
  if (currentResults > 10 && currentPage < getLastPage()) {
    pagination.insertAdjacentHTML('beforeend', next);
  } 
  if (currentPage > 1) {
    pagination.insertAdjacentHTML('afterbegin', prev);
  }
  pagination.insertAdjacentHTML(
    'beforeend',
    `<span>${currentPage} of ${getLastPage()}</span>`
  );
}

function getMovies() {
  fetch(
    TESTING
      ? '/star_wars.json'
      : getUrlWithParam({s: currentSearch, page: currentPage})
  )
    .then(response => response.json())
    .then(result => {
      currentResults = result.totalResults;
      showPagination();

      Promise.all(
        result.Search.map(movie => movie.imdbID).map(id =>
          fetch(
            TESTING ? '/new_hope.json' : getUrlWithParam({i: id})
          ).then(response => response.json())
        )
      ).then(showMovies);
    });
}

function search(event) {
  let movie = movieInput.value;
  if (event.key === 'Enter' && movie !== '') {
    currentSearch = movie;
    currentPage = 1;
    getMovies();
    showPagination();
    movieInput.value = '';
  }
}
