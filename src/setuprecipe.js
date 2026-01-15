import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://sewbsumjjlpsbadgwgfk.supabase.co";
const supabaseKey = "sb_publishable_wSb8KHh3lvlLMMCxSTLQ-Q_bYqvk77x";
const supabase = createClient(supabaseUrl, supabaseKey);

const dropdown = document.getElementById("myDropdown");
const otherInputContainer = document.getElementById("otherInputContainer");
const otherText = document.getElementById("otherText");
const saveCategory = document.getElementById("saveCategory");

const addModuleBtn = document.getElementById("addModuleBtn");
const newModuleContainer = document.getElementById("newModuleContainer");
const newModuleText = document.getElementById("newModuleText");
const saveModule = document.getElementById("saveModule");
const cancelModule = document.getElementById("cancelModule");
const modulesContainer = document.getElementById("modulesContainer");

let communityId = localStorage.getItem("communityId") || null;

dropdown.addEventListener("change", async function () {
  if (this.value === "other") {
    otherInputContainer.style.display = "block";
    otherText.focus();
  } else {
    otherInputContainer.style.display = "none";
    otherText.value = "";
    await saveCommunity(this.value);
  }
});

saveCategory.addEventListener("click", async function () {
  const newCategory = otherText.value.trim();
  if (!newCategory) return;

  const newOption = document.createElement("option");
  newOption.value = newCategory.toLowerCase().replace(/\s+/g, "-");
  newOption.textContent = newCategory;
  newOption.selected = true;

  const otherOption = dropdown.querySelector('option[value="other"]');
  dropdown.insertBefore(newOption, otherOption);

  otherInputContainer.style.display = "none";
  otherText.value = "";

  await saveCommunity(newCategory);
});

async function saveCommunity(type) {
  const { data, error } = await supabase
    .from("communities")
    .insert({ type })
    .select()
    .single();

  if (error) return;

  communityId = data.id;
  localStorage.setItem("communityId", communityId);
}

addModuleBtn.addEventListener("click", function () {
  newModuleContainer.style.display = "block";
  newModuleText.focus();
});

saveModule.addEventListener("click", async function () {
  const newModule = newModuleText.value.trim();
  if (!newModule || !communityId) return;

  const { error } = await supabase
    .from("modules")
    .insert({
      community_id: communityId,
      name: newModule
    });

  if (error) return;

  const newButton = document.createElement("button");
  newButton.className = "module-btn selected";
  newButton.textContent = newModule;

  modulesContainer.insertBefore(newButton, addModuleBtn);

  newModuleContainer.style.display = "none";
  newModuleText.value = "";
});

cancelModule.addEventListener("click", function () {
  newModuleContainer.style.display = "none";
  newModuleText.value = "";
});

otherText.addEventListener("keypress", function (e) {
  if (e.key === "Enter") saveCategory.click();
});

newModuleText.addEventListener("keypress", function (e) {
  if (e.key === "Enter") saveModule.click();
});
