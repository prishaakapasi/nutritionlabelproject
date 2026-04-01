import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://sewbsumjjlpsbadgwgfk.supabase.co";
const supabaseKey = "sb_publishable_wSb8KHh3lvlLMMCxSTLQ-Q_bYqvk77x";
const supabase = createClient(supabaseUrl, supabaseKey);

const moduleOrder = [
  "Infrastructure",
  "Membership + Roles",
  "Rules",
  "Federation",
  "Community Processes",
];

// Legacy module names that have been consolidated — never show these
const deprecatedModules = new Set(["Admin", "Membership", "Roles"]);

const modulePages = {
  "Infrastructure":     "infrastructure.html",
  "Membership + Roles": "membership.html",
  "Community Processes": "communityprocesses.html",
  "Rules":              "rules.html",
  "Federation":         "federation.html",
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
    if (deprecatedModules.has(moduleName)) return;
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
    background: #ffffff;
    border: 2px solid #000000;
    outline: 1px solid #FF8F00;
    outline-offset: -5px;
    cursor: pointer;
    width: 100%;
    text-align: left;
    font-weight: 600;
    font-family: "Cascadia Code", monospace;
    font-size: 14px;
    letter-spacing: 0.04em;
    color: #000000;
    padding: 12px 16px;
    box-sizing: border-box;
    transition: background 0.2s ease;
  `;
  editButton.addEventListener("mouseenter", () => {
    editButton.style.background = "#ffae35";
    editButton.style.outlineColor = "#000000";
  });
  editButton.addEventListener("mouseleave", () => {
    editButton.style.background = "#ffffff";
    editButton.style.outlineColor = "#FF8F00";
  });
  editButton.addEventListener("click", showModuleEditor);
  navContainer.appendChild(editButton);

  const finishButton = document.createElement("button");
  finishButton.className = "sidebar-link finish-btn";
  finishButton.textContent = "Generate Recipe Now";
  finishButton.style.cssText = `
    background: #FF8F00;
    border: 2px solid #000000;
    box-shadow: 4px 4px 0 #000000;
    cursor: pointer;
    width: 100%;
    text-align: left;
    font-weight: 600;
    font-family: "Cascadia Code", monospace;
    font-size: 14px;
    letter-spacing: 0.04em;
    color: #000000;
    padding: 12px 16px;
    margin-top: 12px;
    box-sizing: border-box;
    transition: box-shadow 0.15s ease, transform 0.15s ease;
  `;
  finishButton.addEventListener("mouseenter", () => {
    finishButton.style.boxShadow = "2px 2px 0 #000000";
    finishButton.style.transform = "translate(2px, 2px)";
    finishButton.style.background = "#DF8200";
  });
  finishButton.addEventListener("mouseleave", () => {
    finishButton.style.boxShadow = "4px 4px 0 #000000";
    finishButton.style.transform = "translate(0, 0)";
    finishButton.style.background = "#FF8F00";
  });
  finishButton.addEventListener("click", () => {
    window.location.href = "finalrecipe.html";
  });
  navContainer.appendChild(finishButton);
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
    background: #ffffff;
    padding: 40px;
    border: 2px solid #000000;
    box-shadow: 6px 6px 0 #000000;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    font-family: "Cascadia Code", monospace;
  `;

  modalContent.innerHTML = `
    <h2 style="margin-top: 0; font-family: 'Space Mono', monospace; font-size: clamp(28px, 4vw, 48px); font-weight: 700; letter-spacing: -0.01em; line-height: 1.05;">Edit Your Modules</h2>
    <p style="font-family: 'Cascadia Code', monospace; font-size: 13px; letter-spacing: 0.04em; opacity: 0.65;">Select which modules to include in your community:</p>
    <div id="moduleCheckboxes" style="margin: 20px 0;"></div>
    <div style="margin-top: 20px; display: flex; gap: 8px;">
      <input type="text" id="newModuleName" placeholder="Add custom module..."
        style="padding: 10px 12px; flex: 1; background: #ffffff; border: 2px solid #000000; font-family: 'Cascadia Code', monospace; font-size: 13px; outline: none;">
      <button id="addNewModule" style="padding: 10px 20px; background: #ffffff; color: #000000; border: 2px solid #000000; outline: 1px solid #FF8F00; outline-offset: -4px; cursor: pointer; font-family: 'Cascadia Code', monospace; font-size: 13px; font-weight: 600; letter-spacing: 0.04em; white-space: nowrap;">Add</button>
    </div>
    <div style="margin-top: 30px; display: flex; gap: 12px;">
      <button id="saveModules" style="padding: 12px 24px; background: #FF8F00; color: #000000; border: 2px solid #000000; box-shadow: 4px 4px 0 #000000; cursor: pointer; font-family: 'Cascadia Code', monospace; font-size: 14px; font-weight: 600; letter-spacing: 0.04em;">Save Changes</button>
      <button id="cancelEdit" style="padding: 12px 24px; background: #ffffff; color: #000000; border: 2px solid #000000; outline: 1px solid #FF8F00; outline-offset: -4px; cursor: pointer; font-family: 'Cascadia Code', monospace; font-size: 14px; letter-spacing: 0.04em;">Cancel</button>
    </div>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  loadModuleCheckboxes();

  const addBtn = document.getElementById("addNewModule");
  addBtn.addEventListener("mouseenter", () => { addBtn.style.background = "#ffae35"; addBtn.style.outlineColor = "#000000"; });
  addBtn.addEventListener("mouseleave", () => { addBtn.style.background = "#ffffff"; addBtn.style.outlineColor = "#FF8F00"; });
  addBtn.addEventListener("click", addCustomModule);

  const saveBtn = document.getElementById("saveModules");
  saveBtn.addEventListener("mouseenter", () => { saveBtn.style.boxShadow = "2px 2px 0 #000000"; saveBtn.style.transform = "translate(2px,2px)"; saveBtn.style.background = "#DF8200"; });
  saveBtn.addEventListener("mouseleave", () => { saveBtn.style.boxShadow = "4px 4px 0 #000000"; saveBtn.style.transform = "translate(0,0)"; saveBtn.style.background = "#FF8F00"; });
  saveBtn.addEventListener("click", saveModuleChanges);

  const cancelBtn = document.getElementById("cancelEdit");
  cancelBtn.addEventListener("mouseenter", () => { cancelBtn.style.background = "#ffae35"; cancelBtn.style.outlineColor = "#000000"; });
  cancelBtn.addEventListener("mouseleave", () => { cancelBtn.style.background = "#ffffff"; cancelBtn.style.outlineColor = "#FF8F00"; });
  cancelBtn.addEventListener("click", () => modal.remove());
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
    label.style.cssText = "display: block; margin: 10px 0; cursor: pointer; font-family: 'Cascadia Code', monospace; font-size: 13px; letter-spacing: 0.04em;";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = moduleName;
    checkbox.checked = selectedModules.has(moduleName);
    checkbox.style.marginRight = "10px";
    checkbox.style.accentColor = "#FF8F00";

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(moduleName));
    container.appendChild(label);
  });

  selectedModules.forEach(moduleName => {
    if (deprecatedModules.has(moduleName)) return;
    if (!moduleOrder.includes(moduleName)) {
      const label = document.createElement("label");
      label.style.cssText = "display: block; margin: 10px 0; cursor: pointer; font-family: 'Cascadia Code', monospace; font-size: 13px; letter-spacing: 0.04em; color: #FF8F00;";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = moduleName;
      checkbox.checked = true;
      checkbox.style.marginRight = "10px";
      checkbox.style.accentColor = "#FF8F00";

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
  label.style.cssText = "display: block; margin: 10px 0; cursor: pointer; font-family: 'Cascadia Code', monospace; font-size: 13px; letter-spacing: 0.04em; color: #FF8F00;";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = moduleName;
  checkbox.checked = true;
  checkbox.style.marginRight = "10px";
  checkbox.style.accentColor = "#FF8F00";
  
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