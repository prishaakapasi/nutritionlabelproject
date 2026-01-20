import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://sewbsumjjlpsbadgwgfk.supabase.co";
const supabaseKey = "sb_publishable_wSb8KHh3lvlLMMCxSTLQ-Q_bYqvk77x";
const supabase = createClient(supabaseUrl, supabaseKey);

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
  "Admin": "admintype.html",
  "Rules": "rules.html",
  "Membership": "membership.html",
  "Federation": "federation.html",
  "Infrastructure": "infrastructure.html",
  "Data/Privacy": "dataprivacy.html",
  "Legal Compliance": "legalcompliance.html",
  "Community Processes": "communityprocesses.html"
};

function getModulePage(moduleName) {
  if (modulePages[moduleName]) {
    return modulePages[moduleName];
  }
  return `custommodules.html?module=${encodeURIComponent(moduleName)}`;
}

async function loadNavigation() {
  const communityId = localStorage.getItem("communityId");
  
  if (!communityId) {
    console.error("No community ID found. Redirecting to setup...");
    window.location.href = "setuprecipe.html";
    return;
  }

  const { data, error } = await supabase
    .from("communities")
    .select("selected_modules")
    .eq("id", communityId)
    .single();

  if (error || !data) {
    console.error("Error loading community data:", error);
    return;
  }

  const selectedModules = data.selected_modules || [];
  console.log("Selected modules:", selectedModules);

  generateSideNav(selectedModules);
}

function generateSideNav(modules) {
  const navContainer = document.getElementById("dynamicNav");
  
  if (!navContainer) {
    console.error("Navigation container not found");
    return;
  }

  navContainer.innerHTML = "";

  const orderedModules = [];
  const customModules = [];
  
  modules.forEach(moduleName => {
    if (moduleOrder.includes(moduleName)) {
      orderedModules.push(moduleName);
    } else {
      customModules.push(moduleName);
    }
  });
  
  orderedModules.sort((a, b) => moduleOrder.indexOf(a) - moduleOrder.indexOf(b));
  
  const sortedModules = [...orderedModules, ...customModules];

  sortedModules.forEach(moduleName => {
    const pageUrl = getModulePage(moduleName);
    
    const a = document.createElement("a");
    a.href = pageUrl;
    a.className = "sidebar-link";
    a.textContent = moduleName;
    
    const currentPage = window.location.pathname.split('/').pop();
    const currentModule = new URLSearchParams(window.location.search).get('module');
    
    if (currentPage.includes(pageUrl.split('?')[0]) && 
        (!currentModule || currentModule === moduleName)) {
      a.classList.add("active");
    }
    
    navContainer.appendChild(a);
  });


  const separator = document.createElement("div");
  separator.style.borderTop = "2px solid #000";
  separator.style.margin = "20px 0";
  navContainer.appendChild(separator);

  const editButton = document.createElement("button");
  editButton.className = "sidebar-link edit-modules-btn";
  editButton.textContent = "Edit Modules";
  editButton.style.cssText = `
    background: #fffaf4;
    border: 2px solid #FF8F00;
    cursor: pointer;
    width: 100%;
    text-align: left;
    font-weight: bold;
    color: #FF8F00;
  `;
  editButton.addEventListener("click", showModuleEditor);
  navContainer.appendChild(editButton);
}

window.addEventListener('DOMContentLoaded', loadNavigation);

function showModuleEditor() {
  const modal = document.createElement("div");
  modal.id = "moduleEditorModal";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;

  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    background: #fffaf4;
    padding: 40px;
    border: 2px solid #000;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    font-family: "Courier New", Courier, monospace;
  `;

  modalContent.innerHTML = `
    <h2 style="margin-top: 0;">Edit Your Modules</h2>
    <p>Select which modules to include in your community:</p>
    <div id="moduleCheckboxes" style="margin: 20px 0;"></div>
    <div style="margin-top: 20px;">
      <input type="text" id="newModuleName" placeholder="Add custom module..." 
        style="padding: 10px; width: calc(100% - 120px); background: #fffaf4; border: 2px solid #000; font-family: inherit;">
      <button id="addNewModule" style="padding: 10px 20px; background: #fffaf4; #FF8F00; border: 2px solid #000; cursor: pointer; font-family: inherit;">Add</button>
    </div>
    <div style="margin-top: 30px; display: flex; gap: 10px;">
      <button id="saveModules" style="padding: 12px 24px; background: #FF8F00; border: 2px solid #000; cursor: pointer; font-weight: bold; font-family: inherit;">Save Changes</button>
      <button id="cancelEdit" style="padding: 12px 24px; background: #fffaf4; border: 2px solid #000; cursor: pointer; font-family: inherit;">Cancel</button>
    </div>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  loadModuleCheckboxes();

  document.getElementById("addNewModule").addEventListener("click", addCustomModule);
  document.getElementById("saveModules").addEventListener("click", saveModuleChanges);
  document.getElementById("cancelEdit").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
}


async function loadModuleCheckboxes() {
  const container = document.getElementById("moduleCheckboxes");
  const communityId = localStorage.getItem("communityId");

  if (!communityId) return;

  const { data, error } = await supabase
    .from("communities")
    .select("selected_modules")
    .eq("id", communityId)
    .single();

  if (error || !data) return;

  const selectedModules = new Set(data.selected_modules || []);

  moduleOrder.forEach(moduleName => {
    const label = document.createElement("label");
    label.style.cssText = "display: block; margin: 10px 0; cursor: pointer;";
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = moduleName;
    checkbox.checked = selectedModules.has(moduleName);
    checkbox.style.marginRight = "10px";
    
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(moduleName));
    container.appendChild(label);
  });

  selectedModules.forEach(moduleName => {
    if (!moduleOrder.includes(moduleName)) {
      const label = document.createElement("label");
      label.style.cssText = "display: block; margin: 10px 0; cursor: pointer; color: #FF8F00;";
      
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = moduleName;
      checkbox.checked = true;
      checkbox.style.marginRight = "10px";
      
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(moduleName + " (custom)"));
      container.appendChild(label);
    }
  });
}

function addCustomModule() {
  const input = document.getElementById("newModuleName");
  const moduleName = input.value.trim();
  
  if (!moduleName) return;

  const container = document.getElementById("moduleCheckboxes");
  
  const existing = Array.from(container.querySelectorAll("input[type='checkbox']"))
    .find(cb => cb.value === moduleName);
  
  if (existing) {
    alert("This module already exists!");
    return;
  }

  const label = document.createElement("label");
  label.style.cssText = "display: block; margin: 10px 0; cursor: pointer; color: #FF8F00;";
  
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = moduleName;
  checkbox.checked = true;
  checkbox.style.marginRight = "10px";
  
  label.appendChild(checkbox);
  label.appendChild(document.createTextNode(moduleName + " (custom)"));
  container.appendChild(label);

  input.value = "";
}

async function saveModuleChanges() {
  const communityId = localStorage.getItem("communityId");
  if (!communityId) return;

  const checkboxes = document.querySelectorAll("#moduleCheckboxes input[type='checkbox']");
  const selectedModules = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  if (selectedModules.length === 0) {
    alert("Please select at least one module!");
    return;
  }

  const { error } = await supabase
    .from("communities")
    .update({ selected_modules: selectedModules })
    .eq("id", communityId);

  if (error) {
    console.error("Error saving modules:", error);
    alert("Failed to save changes. Please try again.");
    return;
  }

  document.getElementById("moduleEditorModal").remove();
  await loadNavigation();
  
  alert("Modules updated successfully!");
}