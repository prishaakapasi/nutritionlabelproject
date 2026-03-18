import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://sewbsumjjlpsbadgwgfk.supabase.co";
const supabaseKey = "sb_publishable_wSb8KHh3lvlLMMCxSTLQ-Q_bYqvk77x";
const supabase = createClient(supabaseUrl, supabaseKey);

// ── DOM refs ──────────────────────────────────────────────────────────────────
const communityNameInput   = document.getElementById("communityNameInput");
const communityLinkInput   = document.getElementById("communityLinkInput");
const communityTypeInput   = document.getElementById("communityTypeInput");
const sizeContainer        = document.getElementById("sizeContainer");
const keywordInput         = document.getElementById("keywordInput");
const keywordTagsEl        = document.getElementById("keywordTags");

const addModuleBtn         = document.getElementById("addModuleBtn");
const newModuleContainer   = document.getElementById("newModuleContainer");
const newModuleText        = document.getElementById("newModuleText");
const saveModuleBtn        = document.getElementById("saveModule");
const cancelModuleBtn      = document.getElementById("cancelModule");
const modulesContainer     = document.getElementById("modulesContainer");

// ── State ─────────────────────────────────────────────────────────────────────
let communityId     = localStorage.getItem("communityId") || null;
let selectedModules = new Set();
let selectedSize    = null;
let keywords        = [];

console.log("Initial communityId:", communityId);

// ── Constants ─────────────────────────────────────────────────────────────────
const moduleOrder = [
  "Infrastructure",
  "Admin",
  "Membership",
  "Rules",
  "Federation",
  "Community Processes",
];

const modulePages = {
  "Infrastructure":      "infrastructure.html",
  "Admin":               "admintype.html",
  "Membership":          "membership.html",
  "Rules":               "rules.html",
  "Federation":          "federation.html",
  "Community Processes": "communityprocesses.html",
};

// Default module sets per community type
const typeModuleDefaults = {
  fediverse:       new Set(["Infrastructure", "Admin", "Membership", "Rules", "Federation"]),
  chat:            new Set(["Admin", "Membership", "Rules", "Community Processes"]),
  wiki:            new Set(["Admin", "Membership", "Rules", "Community Processes"]),
  social:          new Set(["Admin", "Membership", "Rules", "Community Processes"]),
  forum:           new Set(["Admin", "Membership", "Rules", "Community Processes"]),
  citizen_science: new Set(["Admin", "Membership", "Rules", "Community Processes", "Infrastructure"]),
  other:           new Set(["Admin", "Membership", "Rules"]),
};

// ── Debounced save helpers ────────────────────────────────────────────────────
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

const saveName = debounce(async (name) => {
  if (name) await saveCommunity({ name });
}, 500);

const saveLink = debounce(async (link) => {
  if (link) await saveCommunity({ link });
}, 500);

communityNameInput.addEventListener("input",  () => saveName(communityNameInput.value.trim()));
communityNameInput.addEventListener("blur",   () => saveName(communityNameInput.value.trim()));

communityLinkInput.addEventListener("input",  () => saveLink(communityLinkInput.value.trim()));
communityLinkInput.addEventListener("blur",   () => saveLink(communityLinkInput.value.trim()));

// ── Community type → auto-select modules ─────────────────────────────────────
communityTypeInput.addEventListener("change", async function () {
  const type = this.value;
  await saveCommunity({ type });

  if (typeModuleDefaults[type]) {
    selectedModules = new Set(typeModuleDefaults[type]);
    refreshModuleButtons();
    await saveSelectedModules();
  }
});

// ── Community size ────────────────────────────────────────────────────────────
sizeContainer.addEventListener("click", async function (e) {
  const btn = e.target.closest(".size-btn");
  if (!btn) return;

  document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  selectedSize = btn.dataset.size;
  await saveCommunity({ size: selectedSize });
});

// ── Keywords (tag input) ──────────────────────────────────────────────────────
function renderKeywords() {
  keywordTagsEl.innerHTML = "";
  keywords.forEach((kw, i) => {
    const tag = document.createElement("span");
    tag.className = "keyword-tag";
    tag.textContent = kw;

    const remove = document.createElement("button");
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Remove ${kw}`);
    remove.addEventListener("click", async () => {
      keywords.splice(i, 1);
      renderKeywords();
      await saveCommunity({ keywords });
    });

    tag.appendChild(remove);
    keywordTagsEl.appendChild(tag);
  });
}

keywordInput.addEventListener("keydown", async function (e) {
  if (e.key === "Tab" || e.key === "Enter") {
    e.preventDefault();
    const kw = this.value.trim();
    if (kw && !keywords.includes(kw)) {
      keywords.push(kw);
      renderKeywords();
      await saveCommunity({ keywords });
    }
    this.value = "";
  }
});

// ── Supabase helpers ──────────────────────────────────────────────────────────
async function saveCommunity(updates) {
  console.log("Saving community with updates:", updates, "and ID:", communityId);

  if (communityId) {
    const { data, error } = await supabase
      .from("communities")
      .update(updates)
      .eq("id", communityId)
      .select();

    if (error) console.error("Error updating community:", error);
    else console.log("Community updated:", data);
  } else {
    const { data, error } = await supabase
      .from("communities")
      .insert(updates)
      .select()
      .single();

    if (error) { console.error("Error creating community:", error); return; }

    console.log("Community created:", data);
    communityId = data.id;
    localStorage.setItem("communityId", communityId);
    console.log("Community ID saved to localStorage:", communityId);
  }
}

// ── Module buttons ────────────────────────────────────────────────────────────
function refreshModuleButtons() {
  document.querySelectorAll(".module-btn").forEach(btn => {
    if (btn.id === "addModuleBtn") return;
    const name = btn.textContent.trim();
    btn.classList.toggle("selected", selectedModules.has(name));
  });
}

modulesContainer.addEventListener("click", async function (e) {
  const btn = e.target.closest(".module-btn");
  if (!btn || btn.id === "addModuleBtn") return;

  btn.classList.toggle("selected");
  const moduleName = btn.textContent.trim();

  if (btn.classList.contains("selected")) selectedModules.add(moduleName);
  else selectedModules.delete(moduleName);

  console.log("Current selected modules:", Array.from(selectedModules));
  await saveSelectedModules();
});

addModuleBtn.addEventListener("click", () => {
  newModuleContainer.style.display = "block";
  newModuleText.focus();
});

saveModuleBtn.addEventListener("click", async function () {
  const newModule = newModuleText.value.trim();
  if (!newModule) return;

  if (!communityId) {
    alert("Please enter a community name first!");
    return;
  }

  const { error } = await supabase
    .from("modules")
    .insert({ community_id: communityId, name: newModule });

  if (error) { console.error("Error saving module:", error); return; }

  const newButton = document.createElement("button");
  newButton.className = "module-btn selected";
  newButton.type = "button";
  newButton.textContent = newModule;
  modulesContainer.insertBefore(newButton, addModuleBtn);

  selectedModules.add(newModule);
  await saveSelectedModules();

  newModuleContainer.style.display = "none";
  newModuleText.value = "";
});

cancelModuleBtn.addEventListener("click", () => {
  newModuleContainer.style.display = "none";
  newModuleText.value = "";
});

newModuleText.addEventListener("keypress", (e) => { if (e.key === "Enter") saveModuleBtn.click(); });

async function saveSelectedModules() {
  if (!communityId) { console.error("Cannot save modules: no communityId"); return; }

  const modulesArray = Array.from(selectedModules);
  const { data, error } = await supabase
    .from("communities")
    .update({ selected_modules: modulesArray })
    .eq("id", communityId)
    .select();

  if (error) console.error("Error saving modules:", error);
  else console.log("Modules saved successfully:", data);
}

// ── Load existing community data ──────────────────────────────────────────────
async function loadCommunityData() {
  if (!communityId) { console.log("No existing communityId found"); return; }
  console.log("Loading data for communityId:", communityId);

  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .eq("id", communityId)
    .single();

  if (error || !data) { console.error("Error loading community:", error); return; }
  console.log("Loaded community data:", data);

  if (data.name) communityNameInput.value = data.name;
  if (data.link) communityLinkInput.value = data.link;

  if (data.type) {
    communityTypeInput.value = data.type;
  }

  if (data.size) {
    selectedSize = data.size;
    document.querySelectorAll(".size-btn").forEach(btn => {
      btn.classList.toggle("selected", btn.dataset.size === selectedSize);
    });
  }

  if (data.keywords && Array.isArray(data.keywords)) {
    keywords = data.keywords;
    renderKeywords();
  }

  if (data.selected_modules && Array.isArray(data.selected_modules)) {
    selectedModules = new Set(data.selected_modules);
    refreshModuleButtons();
    console.log("Restored selected modules:", Array.from(selectedModules));
  }
}

// ── Next button ───────────────────────────────────────────────────────────────
function handleNextButton() {
  const nextButton = document.querySelector(".btn");
  if (!nextButton) { console.error("Next button not found"); return; }

  nextButton.addEventListener("click", function (e) {
    e.preventDefault();

    if (!communityId || !communityNameInput.value.trim()) {
      alert("Please enter a community name first!");
      communityNameInput.focus();
      return;
    }

    if (!communityTypeInput.value) {
      alert("Please select a community type!");
      communityTypeInput.focus();
      return;
    }

    if (!selectedSize) {
      alert("Please select a community size!");
      return;
    }

    if (selectedModules.size === 0) {
      alert("Please select at least one module!");
      return;
    }

    const firstModule = moduleOrder.find(module => selectedModules.has(module));

    if (!firstModule) {
      const customModule = Array.from(selectedModules)[0];
      console.log("Navigating to custom module:", customModule);
      window.location.href = `custommodules.html?module=${encodeURIComponent(customModule)}`;
      return;
    }

    const nextPage = modulePages[firstModule];
    console.log("Navigating to first module:", firstModule, "at", nextPage);
    window.location.href = nextPage;
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", function () {
  loadCommunityData();
  handleNextButton();
});