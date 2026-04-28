const EVENTS_JSON_URL = "assets/events-impro.json";

const cityFilter = document.getElementById("cityFilter");
const eventsList = document.getElementById("eventsList");
const eventsEmpty = document.getElementById("eventsEmpty");

let allEvents = [];

function escapeHtml(value) {
  if (value == null) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function getTodayStart() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function isTodayOrFutureEvent(event) {
  const eventDate = new Date((event.date || "") + "T00:00:00");

  if (Number.isNaN(eventDate.getTime())) {
    return false;
  }

  return eventDate >= getTodayStart();
}

function sortEvents(events) {
  return [...events].sort((a, b) => {
    const aDate = new Date(`${a.date}T${a.time || "00:00"}`);
    const bDate = new Date(`${b.date}T${b.time || "00:00"}`);
    return aDate - bDate;
  });
}

function getUniqueCities(events) {
  return [...new Set(events.map(event => event.city).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "pl"));
}

function renderCityOptions(events) {
  const cities = getUniqueCities(events);

  cityFilter.innerHTML = `<option value="all">Wszystkie</option>`;

  cities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    cityFilter.appendChild(option);
  });
}

function renderEvents(events) {
  if (!events.length) {
    eventsList.innerHTML = "";
    eventsEmpty.hidden = false;
    return;
  }

  eventsEmpty.hidden = true;

  eventsList.innerHTML = events.map(event => {
    const title = escapeHtml(event.title || "");
    const subtitle = escapeHtml(event.subtitle || "");
    const venue = escapeHtml(event.venue || "");
    const city = escapeHtml(event.city || "");
    const time = escapeHtml(event.time || "");
    const url = escapeHtml(event.url || "#");
    const image = event.image ? escapeHtml(event.image) : "";
    const soldOut = event.sold_out === true;

    return `
      <article class="event-card">
        <a class="event-card__link" href="${url}" target="_blank" rel="noopener noreferrer">
          ${
            image
              ? `<img class="event-card__image" src="${image}" alt="${title}">`
              : `<div class="event-card__image event-card__image--placeholder">Brak grafiki</div>`
          }

          <div class="event-card__content">
            <div class="event-card__meta">
              <span>${formatDate(event.date)}</span>
              ${time ? `<span>• ${time}</span>` : ""}
            </div>

            <h3 class="event-card__title">${title}</h3>

            ${subtitle ? `<p class="event-card__subtitle">${subtitle}</p>` : ""}

            <p class="event-card__place">${venue}${city ? `, ${city}` : ""}</p>

            ${
              soldOut
                ? `<span class="event-card__badge">Wyprzedane</span>`
                : `<span class="event-card__cta">Kup bilet</span>`
            }
          </div>
        </a>
      </article>
    `;
  }).join("");
}

function filterEvents() {
  const selectedCity = cityFilter.value;

  const filtered = selectedCity === "all"
    ? allEvents
    : allEvents.filter(event => event.city === selectedCity);

  renderEvents(sortEvents(filtered));
}

async function initEvents() {
  try {
    const response = await fetch(EVENTS_JSON_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("JSON nie jest tablicą");
    }

    allEvents = data.filter(event => {
      return event.active !== false && isTodayOrFutureEvent(event);
    });

    renderCityOptions(allEvents);
    renderEvents(sortEvents(allEvents));

    cityFilter.addEventListener("change", filterEvents);
  } catch (error) {
    console.error("Błąd wczytywania wydarzeń:", error);
    eventsList.innerHTML = `
      <div class="events-error">
        Nie udało się wczytać wydarzeń.
      </div>
    `;
  }
}

initEvents();