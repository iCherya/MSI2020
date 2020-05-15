const menu = document.querySelector('.menu'),
    wrapper = document.querySelector('.wrapper'),
    aside = document.querySelector('.aside'),
    main = document.querySelector('.main'),
    optionsRadio = document.getElementsByName('options-radio'),
    optionsCategories = document.querySelector('.options__categories'),
    searchInput = document.querySelector('.options__search--input')
;


menu.addEventListener('click', () => {
    menu.classList.toggle('menu_active');
    aside.classList.toggle('aside_active');
    wrapper.classList.toggle('block_innactive');
    fullHeightAside();
});
console.dir(aside);
const linksJoke = {
    linkRandom : 'https://api.chucknorris.io/jokes/random',
    linkCategoriesList : 'https://api.chucknorris.io/jokes/categories',
    linkCategory : 'https://api.chucknorris.io/jokes/random?category=',
    linkSearch : 'https://api.chucknorris.io/jokes/search?query=',
};
function fullHeightAside() {
    if (document.querySelector('.aside_active')) {
        if (main.scrollHeight > aside.scrollHeight) {
            aside.classList.toggle('height');
        }
    }
}
function createElement(tagName, props = {}, elInnerHTML) {
    const $el = document.createElement(tagName);

    for (const propName in props) {
        if (propName === 'children' && props.children) {
            $el.append(...props.children);
        } else if (typeof props[propName] !== 'undefined') {
            $el[propName] = props[propName];
        }
    }

    if (elInnerHTML) {
        $el.innerHTML = elInnerHTML;
    }

    return $el;
}

function getHoursLastUpdate(date) {
    let currentTime = new Date(),
        jokeUpdateTime = new Date(date.replace(/-/g,'/').replace('T',' ').replace(/\..*|\+.*/,""));
    return Math.round((currentTime.getTime() - jokeUpdateTime.getTime()) / (1000 * 60 * 60));
  }

function randomInteger(max) {
    return Math.floor(Math.random() * (max + 1));
}

const loading = createElement(
    'div',
    {
        className: 'loading'
    }
);

const tooltip = createElement(
    'div',
    {
        className: 'tooltip-search'
    },
    'Search query must be between 3 and 120 characters'
);


let isCatogiesListReceived = false;
document.querySelector('#category-option').onclick = function () {
    if (!isCatogiesListReceived) {
        wrapper.appendChild(loading);
            fetch(linksJoke.linkCategoriesList)
            .then(response => response.json())
            .then(body => {
                for (let i = 0; i < body.length; i++) {
                    createCatogiesList(body[i]);
                }
                wrapper.removeChild(loading);
            })
            ;
        isCatogiesListReceived = true;
    }
};

function getUrlFromChoosenOption() {
    let url;
    if (optionsRadio[0].checked) {
        url = linksJoke.linkRandom;
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
            url = linksJoke.linkCategory + category;
        } else {
            optionsCategories.classList.add('empty-data-error');
        }
    } else if (optionsRadio[2].checked) {
        let query = searchInput.value.trim();
        if (query.length > 2 && query.length < 121) {
            if (document.querySelector('.tooltip-search')) {
            document.querySelector('.options__search').removeChild(tooltip);
            }
            searchInput.classList.remove('empty-data-error');
            url = linksJoke.linkSearch + query;
        } else {
            document.querySelector('.options__search').appendChild(tooltip);
            searchInput.classList.add('empty-data-error');
        }
    }
    return url;
}

document.querySelector('.options__button').addEventListener("click", function (event) {
    event.preventDefault();
    let url = getUrlFromChoosenOption();
    if (url !== undefined) {
        wrapper.appendChild(loading);
            fetch(url)
            .then(response => response.json())
            .then(body => {
                if (body.total === 0) {
                    createMissedJoke(
                        `Sorry. We can not find any joke with your search query \"${searchInput.value.trim()}\". Please, try again with another one.`
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
                wrapper.removeChild(loading);
            }
            )
            .catch(() => alert('Internet connection is not as fast as Chuck Norris. Please press the button a little slower (c) Chuck')
            );
    }
});

function createCatogiesList(category) {
    let newCategory = createElement(
        'label',
        {
            className: 'options__categories--label'
        },
        `<input type="radio" class="options__categories--input" name="category__radio" value="${category}">
        <span class="options__categories--text">${category}</span>`
    );
    document.querySelector('.options__categories').insertAdjacentElement('beforeend', newCategory);
}

function createJoke(id, link, date, text, category) {
    if (category.length !== 0) {
        category = `<div class="joke__content--info-category">${category}</div>`;
    }

    let newJoke = createElement(
        'div',
        {},
        `<div class="joke-ticket" data-id="${id}">
        <div title="Add to favorites" class="joke-fav" data-id="${id}"></div>
        <div class="joke">
            <div class="joke__icon"></div>
            <div class="joke__content">
                <div class="joke__content--link">ID: <a class="joke__content--link-id" target="blank_" href="${link}">${id}</a></div>
                <div class="joke__content--text">${text}</div>
                <div class="joke__content--info">
                    <span>Last update: <span class="joke__content--info-date">${date}</span> hours ago</span>
                    ${category}
                </div>
            </div>
        </div>
        </div>`
    );
    document.querySelector('.jokes-wrapper').insertAdjacentElement('afterbegin', newJoke);
}

function createMissedJoke(text) {
    let newMissedJoke = createElement (
        'div',
        {
            className: 'joke-ticket missed-joke'
        },
        `<div class="joke missed">
            <div class="joke__icon joke__icon-missed"></div>
            <div class="joke__content">
                <div class="joke__content--text  missed">${text}</div>
            </div>
        </div>`
    );
    document.querySelector('.jokes-wrapper').insertAdjacentElement('afterbegin', newMissedJoke);
}

// FAVOURITES //

if (JSON.parse(localStorage.getItem('favourites')) == null) {
    var favouritesObj = {};
} else {
    var favouritesObj = JSON.parse(localStorage.getItem('favourites'))
};

document.addEventListener('click', function (event) {
    if (!event.target.closest('.joke-fav')) return;
    let idJoke = event.target.dataset.id;
        if (idJoke in favouritesObj) {
            deleteFromFavouritesObj(idJoke);
        } else {
            addToFavouritesObj(idJoke);
        }
});

function deleteFromFavouritesObj(idJoke) {
    let jokeTicket = document.querySelectorAll(`[data-id="${idJoke}"]`);
    if (jokeTicket.length === 2) {
        jokeTicket[0].remove();

    } else {
        jokeTicket[2].remove();
        jokeTicket[1].classList.toggle('joke-fav__aside');
    }
    delete favouritesObj[idJoke];
    createFavoriteJoke();
};

function addToFavouritesObj(idJoke) {
    let jokeTicket = document.querySelector(`[data-id="${idJoke}"]`);
    jokeTicket.querySelector('.joke-fav').classList.toggle('joke-fav__aside');
    let jokeText = jokeTicket.querySelector('.joke__content--text').textContent,
        jokeLink = jokeTicket.querySelector('a[href]').href,
        jokeDate = jokeTicket.querySelector('.joke__content--info-date').textContent
        ;
    favouritesObj[idJoke] = {
        idFav: idJoke,
        textFav: jokeText,
        linkFav: jokeLink,
        timeUpdFav: jokeDate,
    }
    createFavoriteJoke();
}

function clearFavs() {
    let wrapper = document.querySelector('.aside-joke-wrapper'),
    child = wrapper.firstChild;
    while (child) {
        wrapper.removeChild(child);
        child = wrapper.firstChild;
    };
}

function createFavoriteJoke() {
    clearFavs();
    for (key in favouritesObj) {
        let newFavoriteJoke = createElement(
            'div',
            {},
            `<div class="aside-joke-ticket" data-id="${favouritesObj[key].idFav}">
                <div title="Remove from favorites" class="joke-fav joke-fav__aside" data-id="${favouritesObj[key].idFav}"></div>
                <div class="joke">
                    <div class="joke__icon"></div>
                    <div class="joke__content">
                        <div class="joke__content--link">ID: <a class="joke__content--link-id" target="blank_" href="${favouritesObj[key].linkFav}">${favouritesObj[key].idFav}</a></div>
                        <div class="joke__content--text-aside">${favouritesObj[key].textFav}</div>
                        <div class="joke__content--info">Last update: ${favouritesObj[key].timeUpdFav} hours ago</div>
                    </div>
                </div>
            </div>`
        );
        document.querySelector('.aside-joke-wrapper').insertAdjacentElement('afterbegin', newFavoriteJoke);
    }
    localStorage.setItem('favourites', JSON.stringify(favouritesObj));

    if (Object.keys(favouritesObj).length == 0) {
        let nothingInFav = createElement('div', {className: 'nothing-in-fav'}, 'You have not chosen anything yet. Hurry up, Chuck Norris is VERY upset!');
        document.querySelector('.aside-joke-wrapper').insertAdjacentElement('afterbegin', nothingInFav);
    }
}
createFavoriteJoke();
