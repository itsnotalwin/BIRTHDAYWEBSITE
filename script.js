let opened = false;
let count = 0;

const bootBtn = document.getElementById("open-vault-btn");
const boot = document.getElementById("boot-screen");
const vault = document.getElementById("vault");
const progressWrap = document.getElementById("progress-bar-wrap");
const progressFill = document.getElementById("progress-fill");
const progressCount = document.getElementById("progress-count");
const stars = document.getElementById("star-field");

function initStars() {
  for (let i = 0; i < 60; i++) {
    const s = document.createElement("div");
    s.className = "star";
    const size = Math.random() * 3 + 1;
    s.style.width = size + "px";
    s.style.height = size + "px";
    s.style.left = Math.random() * 100 + "vw";
    s.style.top = Math.random() * 100 + "vh";
    s.style.background = "#C7A6FF";

    s.addEventListener("click", () => {
      if (!s.classList.contains("discovered")) {
        s.classList.add("discovered");
        increment();
      }
    });

    stars.appendChild(s);
  }
}

function increment() {
  count++;
  const pct = (count / 22) * 100;

  progressWrap.classList.add("show");
  progressFill.style.width = pct + "%";
  progressCount.textContent = `${count} / 22`;

  if (count >= 22) {
    revealFinal();
  }
}

function revealFinal() {
  document.body.classList.add("distorting");

  setTimeout(() => {
    const letter = document.getElementById("letter-body");
    letter.innerHTML = `
      <p class="letter-big">you found all fragments</p>
      <p>this was never about memory</p>
      <p>it was about presence</p>
    `;
  }, 1200);
}

bootBtn.addEventListener("click", () => {
  boot.classList.add("out");
  vault.classList.add("show");
  initStars();
});