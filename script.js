const menu = document.querySelector('.menu'),
    wrapper = document.querySelector('.wrapper'),
    aside = document.querySelector('.aside'),
    loading = document.querySelector('#spinner'),
    optionsRadio = document.getElementsByName('options-radio'),
    optionsCategories = document.querySelector('.options__categories'),
    searchInput = document.querySelector('.options__search--input');

menu.addEventListener('click', () => {
    menu.classList.toggle('menu_active');
    wrapper.classList.toggle('wrapper_innactive');
    aside.classList.toggle('aside_active');
});

//Chucks Norris Jokes API Links

const linkRandom = 'https://api.chucknorris.io/jokes/random',
    linkCatogiesList = 'https://api.chucknorris.io/jokes/categories',
    linkCategory = 'https://api.chucknorris.io/jokes/random?category=',
    linkSearch = 'https://api.chucknorris.io/jokes/search?query=';


function getHoursLastUpdate(date) {
  let currentTime = new Date();
  return Math.round((currentTime.getTime() - Date.parse(date)) / (1000 * 60 * 60));
}

function randomInteger(max) {
  let rand = Math.random() * (max + 1);
  return Math.floor(rand);
}

// Receive jokes categories list from API

let isCatogiesListReceived = false;
document.querySelector('#category-option').onclick = function () {
    if (!isCatogiesListReceived) {
        loading.classList.add('loading');
        let request = fetch(linkCatogiesList)
            .then(response => response.json())
            .then(body => {

                for (let i = 0; i < body.length; i++) {
                    createCatogiesList(body[i]);
                }
                loading.classList.remove('loading');
            })
            .catch(() => {
                console.log('error');

                alert('Missed connection with server. Wait a minute, reload the page and try again');
                loading.classList.remove('loading');
            });

        isCatogiesListReceived = true;
    }
};

// Get URL for API + checking

function getUrlFromChoosenOption() {
    let url;
    if (optionsRadio[0].checked) {
        url = linkRandom;
    } else if (optionsRadio[1].checked) {
        let categories = document.getElementsByName('category__radio');
        let category;
        for (let i = 0; i < categories.length; i++) {
            if (categories[i].checked) {
                category = categories[i].value;
            }
        }
        if (category != undefined) {
            optionsCategories.classList.remove('empty-data-error');
            url = linkCategory + category;
        } else {
            optionsCategories.classList.add('empty-data-error');
        }
    } else if (optionsRadio[2].checked) {
        let query = searchInput.value.trim();
        if (query !== '') {
            searchInput.classList.remove('empty-data-error');
            url = linkSearch + query;
        } else {
            searchInput.classList.add('empty-data-error');
        }

    }
    return url;
}

// Requests jokes

document.querySelector('.options__button').addEventListener("click", function (event) {
    event.preventDefault();
    let url = getUrlFromChoosenOption();
    if (url !== undefined) {
        loading.classList.add('loading');
        let request = fetch(url)
            .then(response => response.json())
            .then(body => {
                if (body.total === 0) {
                    createJoke(
                        'No joke ID',
                        '#',
                        '0',
                        `Sorry. We can not find any joke from your search query \"${searchInput.value}\". Please, try again with another one.`,
                    );

                } else if (body.total == undefined) {
                    createJoke(
                        body.id,
                        body.url,
                        getHoursLastUpdate(body.updated_at),
                        body.value,
                        body.categories
                    );
                } else if (body.total > 0) {
                    let randJoke = randomInteger(body.total - 1);

                    createJoke(
                        body.result[randJoke].id,
                        body.result[randJoke].url,
                        getHoursLastUpdate(body.result[randJoke].updated_at),
                        body.result[randJoke].value,
                        body.result[randJoke].categories
                    );
                }

                loading.classList.remove('loading');
            })
            .catch(() => {
                console.log('error');

                alert('Missed connection with server. Wait a minute, reload the page and try again');
                loading.classList.remove('loading');
            });
    }
});

// Create categories

function createCatogiesList(category) {
  let newCategory = document.createElement('label');
  newCategory.classList.add('options__categories--label');
  newCategory.innerHTML = `<input type="radio" class="options__categories--input" name="category__radio" value="${category}">
                          <span class="options__categories--text">${category}</span>`;
  document.querySelector('.options__categories').insertAdjacentElement('beforeend', newCategory);
}

// Create Jokes

function createJoke(id, link, date, text, category = '') {
  let newJoke = document.createElement("div");
  newJoke.classList.add('joke-ticket');

  if (category !== '') {
      category = `<div class="joke__content--info-category">${category}</div>`;
  }

  newJoke.innerHTML = `<div class="joke-fav"></div>
                      <div class="joke">
                          <div class="joke__icon"><object type="image/svg+xml" data="./img/message-icon.svg"></object></div>
                          <div class="joke__content">
                              <div class="joke__content--link">ID: <a class="joke__content--link-id" href="${link}" target="_blank">${id}</a></div>
                              <div class="joke__content--text">${text}</div>
                              <div class="joke__content--info"><span>Last update: ${date} hours ago</span>${category}</div>
                            </div>
                       </div>`

  document.querySelector('.jokes-wrapper').insertAdjacentElement('afterbegin', newJoke);
}
