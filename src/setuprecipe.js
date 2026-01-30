import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://sewbsumjjlpsbadgwgfk.supabase.co";
const supabaseKey = "sb_publishable_wSb8KHh3lvlLMMCxSTLQ-Q_bYqvk77x";
const supabase = createClient(supabaseUrl, supabaseKey);

const communityTypeInput = document.getElementById("communityTypeInput");

const addModuleBtn = document.getElementById("addModuleBtn");
const newModuleContainer = document.getElementById("newModuleContainer");
const newModuleText = document.getElementById("newModuleText");
const saveModule = document.getElementById("saveModule");
const cancelModule = document.getElementById("cancelModule");
const modulesContainer = document.getElementById("modulesContainer");

let communityId = localStorage.getItem("communityId") || null;
let selectedModules = new Set();

console.log("Initial communityId:", communityId);

const moduleOrder = [
  "Infrastructure",
  "Admin",
  "Membership",
  "Rules",
  "Federation",
  "Data/Privacy",
  "Community Processes",
  "Legal Compliance"
];

const modulePages = {
  "Infrastructure": "infrastructure.html",
  "Admin": "admintype.html",
  "Membership": "membership.html",
  "Rules": "rules.html",
  "Federation": "federation.html",
  "Data/Privacy": "dataprivacy.html",
  "Legal Compliance": "legalcompliance.html",
  "Community Processes": "communityprocesses.html"
};

let saveTimeout;
communityTypeInput.addEventListener("input", function () {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    const type = this.value.trim();
    if (type) {
      await saveCommunity(type);
    }
  }, 500); 
});

communityTypeInput.addEventListener("blur", async function () {
  const type = this.value.trim();
  if (type) {
    await saveCommunity(type);
  }
});

async function saveCommunity(type) {
  console.log("Saving community type:", type, "with ID:", communityId);
  
  if (communityId) {
    const { data, error } = await supabase
      .from("communities")
      .update({ type })
      .eq("id", communityId)
      .select();
    
    if (error) {
      console.error("Error updating community:", error);
    } else {
      console.log("Community updated:", data);
    }
  } else {
    const { data, error } = await supabase
      .from("communities")
      .insert({ type })
      .select()
      .single();

    if (error) {
      console.error("Error creating community:", error);
      return;
    }

    console.log("Community created:", data);
    communityId = data.id;
    localStorage.setItem("communityId", communityId);
    console.log("Community ID saved to localStorage:", communityId);
  }
}

modulesContainer.addEventListener("click", async function (e) {
  if (e.target.classList.contains("module-btn") && e.target.id !== "addModuleBtn") {
    e.target.classList.toggle("selected");
    
    const moduleName = e.target.textContent.trim();
    console.log("Module clicked:", moduleName);
    
    if (e.target.classList.contains("selected")) {
      selectedModules.add(moduleName);
      console.log("Module selected:", moduleName);
    } else {
      selectedModules.delete(moduleName);
      console.log("Module deselected:", moduleName);
    }
    
    console.log("Current selected modules:", Array.from(selectedModules));
    await saveSelectedModules();
  }
});

addModuleBtn.addEventListener("click", function () {
  newModuleContainer.style.display = "block";
  newModuleText.focus();
});

saveModule.addEventListener("click", async function () {
  const newModule = newModuleText.value.trim();
  if (!newModule) return;
  
  if (!communityId) {
    console.error("Cannot add module: no communityId. Please select a community type first.");
    alert("Please enter a community type first!");
    return;
  }

  const { error } = await supabase
    .from("modules")
    .insert({
      community_id: communityId,
      name: newModule
    });

  if (error) {
    console.error("Error saving module:", error);
    return;
  }

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

cancelModule.addEventListener("click", function () {
  newModuleContainer.style.display = "none";
  newModuleText.value = "";
});

newModuleText.addEventListener("keypress", function (e) {
  if (e.key === "Enter") saveModule.click();
});

async function saveSelectedModules() {
  if (!communityId) {
    console.error("Cannot save modules: no communityId");
    return;
  }

  const modulesArray = Array.from(selectedModules);
  console.log("Saving modules:", modulesArray);

  const { data, error } = await supabase
    .from("communities")
    .update({
      selected_modules: modulesArray
    })
    .eq("id", communityId)
    .select();

  if (error) {
    console.error("Error saving modules:", error);
  } else {
    console.log("Modules saved successfully:", data);
  }
}

async function loadCommunityData() {
  if (!communityId) {
    console.log("No existing communityId found");
    return;
  }

  console.log("Loading data for communityId:", communityId);

  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .eq("id", communityId)
    .single();

  if (error || !data) {
    console.error("Error loading community:", error);
    return;
  }

  console.log("Loaded community data:", data);

  if (data.type) {
    communityTypeInput.value = data.type;
  }

  if (data.selected_modules && Array.isArray(data.selected_modules)) {
    selectedModules = new Set(data.selected_modules);
    document.querySelectorAll(".module-btn").forEach(btn => {
      if (selectedModules.has(btn.textContent.trim())) {
        btn.classList.add("selected");
      }
    });
    console.log("Restored selected modules:", Array.from(selectedModules));
  }
}

function handleNextButton() {
  const nextButton = document.querySelector('.btn');
  if (!nextButton) {
    console.error("Next button not found");
    return;
  }
  
  nextButton.addEventListener('click', function(e) {
    e.preventDefault();
    
    if (!communityId || !communityTypeInput.value.trim()) {
      alert("Please enter a community type first!");
      communityTypeInput.focus();
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

window.addEventListener('DOMContentLoaded', function() {
  loadCommunityData();
  handleNextButton();
});