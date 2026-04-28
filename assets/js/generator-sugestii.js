(function () {
  const CARDS_BY_SECTION = {
    basic: ["miejsce", "przedmiot", "relacja", "cel-postaci", "problem"],
    additional: ["emocja", "sekret"],
    advanced: ["ograniczenia", "gatunek", "czasy-epoka"]
  };

  function pickRandom(items) {
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  }

  function createCard(category) {
    const card = document.createElement("article");
    card.className = "generator-card";

    const title = document.createElement("h3");
    title.className = "generator-card__title";
    title.textContent = category.label;

    const result = document.createElement("p");
    result.className = "generator-card__result";
    result.textContent = "Kliknij „Losuj”";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "event-card__cta generator-card__button";
    button.textContent = "Losuj";

    button.addEventListener("click", function () {
      result.textContent = pickRandom(category.items);
    });

    card.appendChild(title);
    card.appendChild(result);
    card.appendChild(button);

    return card;
  }

  function renderGenerator(data) {
    const categories = [...data.basic, ...data.additional, ...data.advanced].reduce(function (acc, category) {
      acc[category.id] = category;
      return acc;
    }, {});

    Object.keys(CARDS_BY_SECTION).forEach(function (sectionName) {
      const section = document.querySelector('[data-generator-section="' + sectionName + '"]');
      if (!section) return;

      const grid = section.querySelector(".generator-grid");
      if (!grid) return;

      CARDS_BY_SECTION[sectionName].forEach(function (categoryId) {
        const category = categories[categoryId];
        if (!category || !Array.isArray(category.items) || category.items.length === 0) return;
        grid.appendChild(createCard(category));
      });
    });
  }

  function showError(message) {
    const main = document.getElementById("main");
    if (!main) return;

    const error = document.createElement("p");
    error.className = "events-error generator-error";
    error.textContent = message;
    main.insertBefore(error, main.firstChild);
  }

  document.addEventListener("DOMContentLoaded", function () {
    fetch("/assets/generator-sugestii.json")
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Nie udało się wczytać danych generatora.");
        }
        return response.json();
      })
      .then(function (data) {
        renderGenerator(data);
      })
      .catch(function () {
        showError("Nie udało się załadować generatora. Odśwież stronę i spróbuj ponownie.");
      });
  });
})();
