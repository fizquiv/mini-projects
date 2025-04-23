const results = document.querySelector("#results");
const paginationDiv = document.querySelector("#pagination");

let currentPage = 1;
let totalPages;
let nextIterator;
let iterator;

window.onload = () => {
  const form = document.querySelector("#form");
  form.addEventListener("submit", validateForm);
  paginationDiv.addEventListener("click", handlePagination);
};

function validateForm(e) {
  e.preventDefault();

  const searchTerm = document.querySelector("#search-term").value;

  if (searchTerm === "") {
    showAlert("Please enter a search term.");
    return;
  }
  currentPage = 1;
  fetchImages();
}

// Shows an alert message
function showAlert(message) {
  const existingAlert = document.querySelector(".bg-red-100");
  if (!existingAlert) {
    const alert = document.createElement("p");

    alert.classList.add(
      "bg-red-100",
      "border-red-400",
      "text-red-700",
      "px-4",
      "py-3",
      "rounded",
      "max-w-lg",
      "mx-auto",
      "mt-6",
      "text-center"
    );

    alert.innerHTML = `
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline">${message}</span>
    `;

    const form = document.querySelector("#form");
    form.appendChild(alert);

    setTimeout(() => {
      alert.remove();
    }, 3000);
  }
}

// Fetch images from the API
function fetchImages() {
  const searchTerm = document.querySelector("#search-term").value;
  const key = "1732750-d45b5378879d1e877cd1d35a6";
  const url = `https://pixabay.com/api/?key=${key}&q=${searchTerm}&per_page=30&page=${currentPage}`;
  nextIterator = null;
  fetch(url)
    .then((response) => response.json())
    .then((result) => {
      totalPages = calculatePages(result.totalHits);
      displayImages(result.hits);
    });
}

function displayImages(images) {
  while (results.firstChild) {
    results.removeChild(results.firstChild);
  }

  images.forEach((image) => {
    const { likes, views, previewURL, largeImageURL } = image;
    results.innerHTML += `
      <div class="w-1/4 md:w-1/6 lg:w-1/8 mb-4 p-2 gap-4">
        <div class="bg-gray-800 rounded-md p-2 shadow-lg">
          <div class="bg-gray-800 rounded-md overflow-hidden">
            <img class="w-full h-48 object-cover" src="${previewURL}">
          </div>
          <div>
            <p class="mt-2 card-text font-bold text-xs">${likes} <span class="font-light">Likes</span></p>
            <p class="card-text font-bold text-xs">${views} <span class="font-light">Views</span></p>
            <a href="${largeImageURL}" 
            rel="noopener noreferrer" 
            target="_blank" 
            class="bg-purple-700 w-full p-1 block mt-2 rounded text-center font-bold uppercase hover:bg-purple-500 text-white text-sm"> See Full Image </a>
          </div>
        </div>
      </div>
    `;
  });

  iterator = createPaginator(totalPages);

  if (!nextIterator) {
    showPagination();
  }
}

function showPagination() {
  paginationDiv.innerHTML = "";
  nextIterator = createPaginator(totalPages);
  while (true) {
    const { value, done } = nextIterator.next();
    if (done) return;

    const nextButton = document.createElement("a");
    nextButton.href = "#";
    nextButton.dataset.page = value;
    nextButton.textContent = value;
    nextButton.classList.add(
      "next",
      "bg-purple-800",
      "hover:bg-purple-500",
      "text-white",
      "px-4",
      "py-1",
      "mr-2",
      "mx-auto",
      "mb-10",
      "font-bold",
      "uppercase",
      "rounded"
    );
    paginationDiv.appendChild(nextButton);
  }
}

function calculatePages(total) {
  return parseInt(Math.ceil(total / 30));
}

// Generator for pagination
function* createPaginator(total) {
  for (let i = 1; i <= total; i++) {
    yield i;
  }
}

function handlePagination(e) {
  if (e.target.classList.contains("next")) {
    currentPage = Number(e.target.dataset.page);
    fetchImages();
    const form = document.querySelector("#form");
    form.scrollIntoView();
  }
}

function printPaginator() {
  iterator = createPaginator(totalPages);
  console.log(iterator.next().value);
}
