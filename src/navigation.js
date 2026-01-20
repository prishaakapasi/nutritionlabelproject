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
}

window.addEventListener('DOMContentLoaded', loadNavigation);