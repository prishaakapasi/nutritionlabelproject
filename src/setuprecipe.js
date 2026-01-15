import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://sewbsumjjlpsbadgwgfk.supabase.co";
const supabaseKey = "sb_publishable_wSb8KHh3lvlLMMCxSTLQ-Q_bYqvk77x";
const supabase = createClient(supabaseUrl, supabaseKey);

const dropdown = document.getElementById("myDropdown");
const otherInputContainer = document.getElementById("otherInputContainer");
const otherText = document.getElementById("otherText");
const saveCategory = document.getElementById("saveCategory");

const modulesContainer = document.getElementById("modulesContainer");
const addModuleBtn = document.getElementById("addModuleBtn");
const newModuleContainer = document.getElementById("newModuleContainer");
const newModuleText = document.getElementById("newModuleText");
const saveModule = document.getElementById("saveModule");
const cancelModule = document.getElementById("cancelModule");

let userId = null;
let communityId = null;

const session = await supabase.auth.getSession();
if (!session.data.session) {
  const { data } = await supabase.auth.signInAnonymously();
  userId = data.user.id;
} else {
  userId = session.data.session.user.id;
}

dropdown.addEventListener("change", async () => {
  if (dropdown.value === "other") {
    otherInputContainer.style.display = "block";
    otherText.focus();
  } else {
    otherInputContainer.style.display = "none";
    otherText.value = "";
    await saveCommunity(dropdown.value);
  }
});

saveCategory.addEventListener("click", async () => {
  const value = otherText.value.trim();
  if (!value) return;

  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  option.selected = true;

  dropdown.insertBefore(option, dropdown.querySelector('option[value="other"]'));
  otherInputContainer.style.display = "none";
  otherText.value = "";

  await saveCommunity(value);
});

async function saveCommunity(type) {
  if (communityId) return;

  const { data } = await supabase
    .from("communities")
    .insert({
      type,
      user_id: userId
    })
    .select()
    .single();

  if (data) communityId = data.id;
}

modulesContainer.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("module-btn")) return;
  if (!communityId) return;

  const name = e.target.textContent;

  if (e.target.classList.contains("selected")) return;

  const { error } = await supabase
    .from("modules")
    .insert({
      community_id: communityId,
      name
    });

  if (!error) e.target.classList.add("selected");
});

addModuleBtn.addEventListener("click", () => {
  newModuleContainer.style.display = "block";
  newModuleText.focus();
});

saveModule.addEventListener("click", async () => {
  const name = newModuleText.value.trim();
  if (!name || !communityId) return;

  const { error } = await supabase
    .from("modules")
    .insert({
      community_id: communityId,
      name
    });

  if (error) return;

  const btn = document.createElement("button");
  btn.className = "module-btn selected";
  btn.textContent = name;

  modulesContainer.insertBefore(btn, addModuleBtn);

  newModuleContainer.style.display = "none";
  newModuleText.value = "";
});

cancelModule.addEventListener("click", () => {
  newModuleContainer.style.display = "none";
  newModuleText.value = "";
});

otherText.addEventListener("keypress", (e) => {
  if (e.key === "Enter") saveCategory.click();
});

newModuleText.addEventListener("keypress", (e) => {
  if (e.key === "Enter") saveModule.click();
});
