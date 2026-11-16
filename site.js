// 首頁：讀取 data/pages.json，產生分類卡片、篩選與搜尋。
// 新增頁面時不需要改這個檔案，只要在 data/pages.json 加一筆資料（見 CLAUDE.md）。
const CAT_NAME = { fabrics: "布料", care: "洗標", rules: "標示法規" };

async function init() {
  const box = document.getElementById("cards");
  let pages = [];
  try {
    pages = await fetch("data/pages.json").then(r => r.json());
    // 依分類排序（布料 → 洗標 → 標示法規），同分類維持 pages.json 裡的順序
    const order = Object.keys(CAT_NAME);
    pages = pages.map((p, i) => ({ ...p, i }))
      .sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category) || a.i - b.i);
  } catch (e) {
    box.innerHTML = "<p>讀不到 data/pages.json。請用 GitHub Pages 或本機伺服器開啟，不要直接雙擊 HTML 檔。</p>";
    return;
  }

  let cat = (location.hash || "#all").slice(1);
  if (!CAT_NAME[cat]) cat = "all";
  const search = document.getElementById("search");

  function render() {
    const q = search.value.trim().toLowerCase();
    const list = pages.filter(p =>
      (cat === "all" || p.category === cat) &&
      (!q || [p.title, p.en, p.summary, ...(p.keywords || [])].join(" ").toLowerCase().includes(q))
    );
    box.innerHTML = list.length ? list.map(p => `
      <a class="card" href="${p.path}">
        <span class="tag ${p.category}">${CAT_NAME[p.category]}</span>
        <h3>${p.icon || ""} ${p.title}</h3>
        <p>${p.summary}</p>
      </a>`).join("") : "<p>找不到符合的頁面。</p>";
    document.querySelectorAll("#toolbar button").forEach(b =>
      b.classList.toggle("on", b.dataset.cat === cat));
  }

  document.querySelectorAll("#toolbar button").forEach(b =>
    b.addEventListener("click", () => { cat = b.dataset.cat; history.replaceState(null, "", "#" + cat); render(); }));
  search.addEventListener("input", render);
  window.addEventListener("hashchange", () => {
    const c = location.hash.slice(1); if (CAT_NAME[c] || c === "all") { cat = c; render(); }
  });
  render();
}
init();
