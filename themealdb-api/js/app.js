function startApp() {
  const selectCategories = document.querySelector("#categories");
  if (selectCategories) {
    selectCategories.addEventListener("change", selectCategory);
    fetchCategories();
  }
  const favoritesDiv = document.querySelector(".favorites");
  const results = document.querySelector("#results");

  if (favoritesDiv) fetchFavorites();

  const modal = new bootstrap.Modal("#modal", {});

  function fetchCategories() {
    const url = "https://www.themealdb.com/api/json/v1/1/categories.php";
    fetch(url)
      .then((response) => response.json())
      .then((result) => displayCategories(result.categories));
  }

  function displayCategories(categories = []) {
    categories.forEach((category) => {
      const option = document.createElement("OPTION");
      option.value = category.strCategory;
      option.textContent = category.strCategory;
      selectCategories.appendChild(option);
    });
  }

  function selectCategory(e) {
    clearHtml(results);
    const category = e.target.value;
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
    fetch(url)
      .then((response) => response.json())
      .then((result) => displayRecipes(result.meals));
  }

  function displayRecipes(recipes = []) {
    const heading = document.createElement("h2");
    heading.classList.add("text-center", "text-black", "my-5");
    heading.textContent = recipes.length ? "Results" : "No results found";
    results.appendChild(heading);

    recipes.forEach((recipe) => {
      const { idMeal, strMeal, strMealThumb } = recipe;

      const recipeContainer = document.createElement("div");
      recipeContainer.classList.add("col-md-3");

      const recipeCard = document.createElement("div");
      recipeCard.classList.add("card", "mb-4", "border-0", "shadow");

      const recipeImage = document.createElement("img");
      recipeImage.classList.add("card-img-top");
      recipeImage.alt = `Image of recipe ${strMeal ?? recipe.name}`;
      recipeImage.src = strMealThumb ?? recipe.img;

      const recipeCardBody = document.createElement("div");
      recipeCardBody.classList.add("card-body");

      const recipeTitle = document.createElement("h3");
      recipeTitle.classList.add("card-title", "mb-3");
      recipeTitle.textContent = strMeal ?? recipe.name;

      const recipeButton = document.createElement("button");
      recipeButton.classList.add("btn", "btn-primary", "w-100");
      recipeButton.textContent = "View Recipe";

      recipeButton.onclick = function () {
        selectRecipe(idMeal ?? recipe.id);
      };

      recipeCardBody.appendChild(recipeTitle);
      recipeCardBody.appendChild(recipeButton);

      recipeCard.appendChild(recipeImage);
      recipeCard.appendChild(recipeCardBody);

      recipeContainer.appendChild(recipeCard);
      results.appendChild(recipeContainer);
    });
  }

  function selectRecipe(id) {
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    fetch(url)
      .then((response) => response.json())
      .then((result) => showRecipeModal(result.meals[0]));
  }

  function showRecipeModal(recipe) {
    const { idMeal, strInstructions, strMeal, strMealThumb } = recipe;

    const modalTitle = document.querySelector(".modal .modal-title");
    const modalBody = document.querySelector(".modal .modal-body");

    modalTitle.textContent = strMeal;
    modalBody.innerHTML = `
      <img class="img-fluid" src="${strMealThumb}" alt="Recipe ${strMeal}" />
      <h3 class="my-3">Instructions</h3>
      <p>${strInstructions}</p>
      <h3 class="my-3">Ingredients and Quantities</h3>
    `;

    const listGroup = document.createElement("UL");
    listGroup.classList.add("list-group");
    for (let i = 1; i <= 20; i++) {
      if (recipe[`strIngredient${i}`]) {
        const ingredient = recipe[`strIngredient${i}`];
        const quantity = recipe[`strMeasure${i}`];

        const ingredientLi = document.createElement("LI");
        ingredientLi.classList.add("list-group-item");
        ingredientLi.textContent = `${ingredient} - ${quantity}`;

        listGroup.appendChild(ingredientLi);
      }
    }

    modalBody.appendChild(listGroup);

    const modalFooter = document.querySelector(".modal-footer");
    clearHtml(modalFooter);

    const favoriteButton = document.createElement("button");
    favoriteButton.classList.add("btn", "btn-primary", "col");
    favoriteButton.textContent = existsInStorage(idMeal)
      ? "Remove Favorite"
      : "Save Favorite";

    favoriteButton.onclick = function () {
      if (existsInStorage(idMeal)) {
        removeFavorite(idMeal);
        favoriteButton.textContent = "Save Favorite";
        showToast("Removed Successfully");
        if (window.location.pathname.includes("favorites.html")) {
          clearHtml(results);
          fetchFavorites();
        }
        return;
      }

      addFavorite({
        id: idMeal,
        name: strMeal,
        img: strMealThumb,
      });
      favoriteButton.textContent = "Remove Favorite";
      if (window.location.pathname.includes("favorites.html")) {
        clearHtml(results);
        fetchFavorites();
      }
      showToast("Saved Successfully");
    };

    const closeButton = document.createElement("button");
    closeButton.classList.add("btn", "btn-secondary", "col");
    closeButton.textContent = "Close";
    closeButton.onclick = function () {
      modal.hide();
    };

    modalFooter.appendChild(favoriteButton);
    modalFooter.appendChild(closeButton);

    modal.show();
  }

  function addFavorite(recipe) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];
    localStorage.setItem("favorites", JSON.stringify([...favorites, recipe]));
  }

  function removeFavorite(id) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];
    const updatedFavorites = favorites.filter((favorite) => favorite.id !== id);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  }

  function existsInStorage(id) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];
    return favorites.some((favorite) => favorite.id === id);
  }

  function showToast(message) {
    const toastDiv = document.querySelector("#toast");
    const toastBody = document.querySelector(".toast-body");
    const toast = new bootstrap.Toast(toastDiv);
    toastBody.textContent = message;
    toast.show();
  }

  function fetchFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];
    if (favorites.length) {
      displayRecipes(favorites);
      return;
    }
    const noFavorites = document.createElement("p");
    noFavorites.textContent = "No favorites yet";
    noFavorites.classList.add("fs-4", "text-center", "font-bold", "mt-5");
    favoritesDiv.appendChild(noFavorites);
  }

  function clearHtml(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  }
}

document.addEventListener("DOMContentLoaded", startApp);
