const themeToggle = document.getElementById("themeToggle");
const projectGrid = document.getElementById("projectGrid");

// 1. Dark / light theme button
themeToggle.addEventListener("click", function () {
  document.body.classList.toggle("light-mode");
  if (document.body.classList.contains("light-mode")) {
    localStorage.setItem("portfolio-theme", "light");
  } else {
    localStorage.setItem("portfolio-theme", "dark");
  }
});

// Remember the theme when the page is opened again
if (localStorage.getItem("portfolio-theme") === "light") {
  document.body.classList.add("light-mode");
}

// 2. Load the projects from the server (they are stored in MongoDB)
async function loadProjects() {
  try {
    const res = await fetch("/projects");
    const projects = await res.json();

    projectGrid.innerHTML = "";

    projects.forEach(p => {
      const card = document.createElement("article");
      card.className = "project-card";

      const title = document.createElement("h3");
      title.textContent = p.title;

      const description = document.createElement("p");
      description.textContent = p.description;

      card.appendChild(title);
      card.appendChild(description);

      p.technologies.forEach(t => {
        const tag = document.createElement("span");
        tag.textContent = t;
        card.appendChild(tag);
      });

      projectGrid.appendChild(card);
    });
  } catch (err) {
    projectGrid.textContent = "Could not load projects. Is the server running?";
  }
}

loadProjects();   // run once when the page opens

// 3. Contact form
const contactForm = document.getElementById("contactForm");
const formMsg = document.getElementById("formMsg");

function showMessage(text, isError) {
  formMsg.textContent = text;
  formMsg.className = isError ? "error" : "success";
}

// Form submit: browser-side validation first, then send to server
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (name.length < 3) return showMessage("Name must be at least 3 characters", true);
  if (!emailPattern.test(email)) return showMessage("Enter a valid email", true);
  if (message.length < 5) return showMessage("Message must be at least 5 characters", true);

  try {
    const res = await fetch("/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message })
    });
    const result = await res.json();
    showMessage(result.message, !res.ok);
    if (res.ok) {
      contactForm.reset();
    }
  } catch (err) {
    showMessage("Could not send the message. Is the server running?", true);
  }
});
