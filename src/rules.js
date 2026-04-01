import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://sewbsumjjlpsbadgwgfk.supabase.co";
const supabaseKey = "sb_publishable_wSb8KHh3lvlLMMCxSTLQ-Q_bYqvk77x";
const supabase = createClient(supabaseUrl, supabaseKey);


const QUALIFIER_OPTIONS = [
  "Allowed",
  "Not allowed",
  "Allowed with labeling / disclosure",
  "Approval required"
];

const RULES_DATA = {
  behavior: [
    {
      id: "civility",
      name: "Civility & good-faith participation",
      qualifier: false,
      rules: [
        "Be respectful to other members",
        "No personal attacks or insults",
        "No trolling, flamebait, or deliberately disruptive behavior",
        "Respect names, pronouns, and boundaries",
        "Respect moderator instructions & Code of Conduct"
      ]
    },
    {
      id: "harassment",
      name: "Harassment and personal safety",
      qualifier: false,
      rules: [
        "No harassment", "No bullying", "No dogpiling", "No stalking",
        "No threats or intimidation", "No doxxing", "No block evasion",
        "No unwanted sexual advances", "No misinformation / fake news",
        "No repeated unwanted contact",
        "No posting private information without consent"
      ]
    },
    {
      id: "discrimination",
      name: "Discrimination and hateful conduct",
      qualifier: false,
      rules: [
        "No hate speech", "No racism", "No sexism or misogyny", "No homophobia",
        "No transphobia", "No ableism", "No xenophobia", "No casteism",
        "No antisemitism", "No Islamophobia",
        "No targeted misgendering or deadnaming",
        "No dehumanizing language toward protected groups"
      ]
    },
    {
      id: "authenticity",
      name: "Authenticity and account integrity",
      qualifier: true,
      rules: ["No impersonation", "Parody accounts", "Bot accounts"]
    },
    {
      id: "spam",
      name: "Spam, advertising, and platform misuse",
      qualifier: true,
      rules: [
        "No spam", "Mass-following or mass-replying",
        "Unsolicited advertising & unsolicited DMs for promotion",
        "Personal project / non-commercial / non-profit promotion",
        "Commercial advertising", "Fundraising or donation requests",
        "Affiliate links", "SEO / link-farming accounts"
      ]
    },
    {
      id: "onboarding",
      name: "Instance access & onboarding constraints",
      qualifier: false,
      rules: [
        "Users must be 18+",
        "Users must provide a reason for joining",
        "This server is for a specific community or interest",
        "Primary language expectation",
        "Registrations are manually reviewed",
        "Users must complete profile information"
      ]
    }
  ],
  content: [
    {
      id: "cw",
      name: "Content warnings & sensitive media labeling",
      qualifier: true,
      rules: [
        "Content warning for sexual content",
        "Content warning for graphic violence / gore",
        "Content warning for disturbing or traumatic topics",
        "Content warning for spoilers",
        "Alt text for image posts"
      ]
    },
    {
      id: "ai",
      name: "AI-generated media, attribution, and copyright",
      qualifier: true,
      rules: [
        "AI-generated media", "No AI impersonation of real people",
        "Credit original creators", "No reposting without permission",
        "No copyright infringement", "No scraped or stolen creative work",
        "Fanworks / derivatives must be credited where relevant"
      ]
    },
    {
      id: "nsfw",
      name: "Adult / explicit content rules",
      qualifier: true,
      rules: [
        "Explicit sexual content", "Nudity",
        "Adult content is allowed if labeled",
        "Sexualized depictions of minors",
        "Non-consensual sexual content",
        "Revenge porn / intimate media",
        "NSFW avatars / header images",
        "Real-person explicit content"
      ]
    },
    {
      id: "illegal",
      name: "Illegal / jurisdiction-specific prohibited content",
      qualifier: false,
      rules: ["No illegal content under applicable local law"]
    },
    {
      id: "violence",
      name: "Violence, threats, extremism, and self-harm",
      qualifier: true,
      rules: [
        "Violent content", "Extremist propaganda",
        "Terrorist content", "Self-harm / suicidal content"
      ]
    }
  ]
};


const rbState = {};
[...RULES_DATA.behavior, ...RULES_DATA.content].forEach(t => {
  rbState[t.id] = { open: false, checked: {}, qualifier: "" };
  t.rules.forEach(r => { rbState[t.id].checked[r] = false; });
});


function rbRender() {
  rbRenderSection("rb-behavior", RULES_DATA.behavior);
  rbRenderSection("rb-content", RULES_DATA.content);
  rbRenderSummary();
}

function rbRenderSection(containerId, types) {
  const el = document.getElementById(containerId);
  el.innerHTML = "";

  types.forEach(t => {
    const s = rbState[t.id];
    const count = Object.values(s.checked).filter(Boolean).length;
    const anyChecked = count > 0;

    const div = document.createElement("div");
    div.className = "type-row";


    const header = document.createElement("div");
    header.className = "type-header";
    header.dataset.typeId = t.id;
    header.innerHTML = `
      <span class="type-name">${t.name}</span>
      ${anyChecked ? `<span class="type-count">[${count} selected]</span>` : ""}
      <span class="type-chevron ${s.open ? "open" : ""}">▼</span>
    `;
    header.addEventListener("click", () => {
      rbState[t.id].open = !rbState[t.id].open;
      rbRender();
    });

    const panel = document.createElement("div");
    panel.className = `rules-panel ${s.open ? "open" : ""}`;

    t.rules.forEach(r => {
      const item = document.createElement("div");
      item.className = "rb-rule-item";
      item.innerHTML = `
        <div class="rb-check ${s.checked[r] ? "checked" : ""}"></div>
        <span class="rb-rule-label">${r}</span>
      `;
      item.addEventListener("click", () => {
        rbState[t.id].checked[r] = !rbState[t.id].checked[r];
        rbRender();
        window.autoSaveData();
      });
      panel.appendChild(item);
    });

    if (t.qualifier && anyChecked) {
      const qBlock = document.createElement("div");
      qBlock.className = "qualifier-block";
      qBlock.innerHTML = `<div class="qualifier-title">Qualifier / rule setting — applies to checked items above</div>`;

      const qOptions = document.createElement("div");
      qOptions.className = "q-options";

      QUALIFIER_OPTIONS.forEach((o, i) => {
        const qOpt = document.createElement("div");
        qOpt.className = "q-option";
        qOpt.innerHTML = `
          <div class="rb-radio ${s.qualifier === o ? "selected" : ""}"></div>
          <span>${i + 1}. ${o}</span>
        `;
        qOpt.addEventListener("click", (e) => {
          e.stopPropagation();
          rbState[t.id].qualifier = rbState[t.id].qualifier === o ? "" : o;
          rbRender();
          window.autoSaveData();
        });
        qOptions.appendChild(qOpt);
      });

      qBlock.appendChild(qOptions);
      panel.appendChild(qBlock);
    }

    div.appendChild(header);
    div.appendChild(panel);
    el.appendChild(div);
  });
}

function rbRenderSummary() {
  const el = document.getElementById("rb-summary-body");
  const allTypes = [...RULES_DATA.behavior, ...RULES_DATA.content];
  let html = "";

  allTypes.forEach(t => {
    const s = rbState[t.id];
    const checked = Object.entries(s.checked).filter(([, v]) => v).map(([k]) => k);
    if (!checked.length) return;
    const qual = s.qualifier ? `<span class="rb-summary-qual">→ ${s.qualifier}</span>` : "";
    html += `
      <div class="rb-summary-group">
        <div class="rb-summary-group-name">${t.name}</div>
        ${checked.map(r => `<div class="rb-summary-rule">${r}${qual}</div>`).join("")}
      </div>
    `;
  });

  el.innerHTML = html || '<p class="rb-summary-empty">No rules selected yet.</p>';
}


function collectFormData() {
  const covenants = [];
  document.querySelectorAll('#covenant-list .covenant-item').forEach(item => {
    const select = item.querySelector('select');
    const customInput = item.querySelector('.custom-covenant-input');
    if (select.value === 'custom' && customInput.value.trim()) {
      covenants.push(customInput.value.trim());
    } else if (select.value && select.value !== 'custom') {
      covenants.push(select.value);
    }
  });

  const rulesBuilder = {};
  Object.entries(rbState).forEach(([id, s]) => {
    rulesBuilder[id] = {
      checked: { ...s.checked },
      qualifier: s.qualifier
    };
  });

  return {
    communityRulesLink: document.getElementById('communityRulesLink').value,
    covenants,
    adaptedFrom: document.getElementById('adaptedFrom').value,
    rulesBuilder,
  };
}

function escHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function populateForm(d) {
  if (d.communityRulesLink) document.getElementById('communityRulesLink').value = d.communityRulesLink;
  if (d.adaptedFrom) document.getElementById('adaptedFrom').value = d.adaptedFrom;

  if (d.covenants && Array.isArray(d.covenants)) {
    const covenantList = document.getElementById('covenant-list');
    covenantList.innerHTML = '';
    const predefined = [
      "Mastodon Server Covenant",
      "Discord Community Guidelines",
      "Bonfire Community Guidelines",
      "Bluesky Community Guidelines"
    ];
    d.covenants.forEach(covenant => {
      const isCustom = !predefined.includes(covenant);
      const newItem = document.createElement('div');
      newItem.className = 'covenant-item';
      newItem.innerHTML = `
        <select onchange="window.handleCovenantChange(this)">
          <option value="">Select a covenant...</option>
          <option value="Mastodon Server Covenant" ${covenant === "Mastodon Server Covenant" ? 'selected' : ''}>Mastodon Server Covenant</option>
          <option value="Discord Community Guidelines" ${covenant === "Discord Community Guidelines" ? 'selected' : ''}>Discord Community Guidelines</option>
          <option value="Bonfire Community Guidelines" ${covenant === "Bonfire Community Guidelines" ? 'selected' : ''}>Bonfire Community Guidelines</option>
          <option value="Bluesky Community Guidelines" ${covenant === "Bluesky Community Guidelines" ? 'selected' : ''}>Bluesky Community Guidelines</option>
          <option value="custom" ${isCustom ? 'selected' : ''}>Custom</option>
        </select>
        <input type="text" class="custom-covenant-input" placeholder="Enter custom covenant name"
          value="${isCustom ? escHtml(covenant) : ''}"
          style="display: ${isCustom ? 'block' : 'none'}; margin-top: var(--spacing-sm); width: 100%; flex-basis: 100%;">
      `;
      covenantList.appendChild(newItem);
      newItem.querySelector('.custom-covenant-input').addEventListener('input', window.autoSaveData);
    });
  }

  if (d.rulesBuilder) {
    Object.entries(d.rulesBuilder).forEach(([id, s]) => {
      if (!rbState[id]) return;
      rbState[id].qualifier = s.qualifier || "";
      Object.entries(s.checked || {}).forEach(([rule, val]) => {
        if (Object.prototype.hasOwnProperty.call(rbState[id].checked, rule)) {
          rbState[id].checked[rule] = val;
        }
      });
    });
    rbRender();
  }
}


async function loadRulesData() {
  const communityId = localStorage.getItem("communityId");
  if (!communityId) return;
  const { data, error } = await supabase
    .from("communities")
    .select("rules_data")
    .eq("id", communityId)
    .single();
  if (error) { console.error("Error loading rules data:", error); return; }
  if (data?.rules_data) populateForm(data.rules_data);
}

async function saveRulesData() {
  const communityId = localStorage.getItem("communityId");
  if (!communityId) return false;
  const { error } = await supabase
    .from("communities")
    .update({ rules_data: collectFormData() })
    .eq("id", communityId);
  if (error) { console.error("Error saving rules data:", error); return false; }
  console.log("Rules data saved");
  return true;
}

let saveTimeout;
window.autoSaveData = function () {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveRulesData, 1000);
};


function updateAddCovenantBtn() {
  const items = document.querySelectorAll("#covenant-list .covenant-item");
  const last = items[items.length - 1];
  if (!last) return;
  const sel = last.querySelector("select");
  const ci = last.querySelector(".custom-covenant-input");
  const hasValue = (sel.value && sel.value !== "custom") || (sel.value === "custom" && ci.value.trim());
  document.getElementById("addCovenantBtn").style.display = hasValue ? "inline-block" : "none";
}

window.handleCovenantChange = function (select) {
  const customInput = select.parentElement.querySelector('.custom-covenant-input');
  if (select.value === 'custom') {
    customInput.style.display = 'block';
    customInput.focus();
    customInput.addEventListener('input', () => { updateAddCovenantBtn(); window.autoSaveData(); });
  } else {
    customInput.style.display = 'none';
    customInput.value = '';
  }
  updateAddCovenantBtn();
  window.autoSaveData();
};

window.addCovenant = function () {
  const list = document.getElementById('covenant-list');
  const newItem = document.createElement('div');
  newItem.className = 'covenant-item';
  newItem.innerHTML = `
    <select onchange="window.handleCovenantChange(this)">
      <option value="">Select a covenant...</option>
      <option value="Mastodon Server Covenant">Mastodon Server Covenant</option>
      <option value="Discord Community Guidelines">Discord Community Guidelines</option>
      <option value="Bonfire Community Guidelines">Bonfire Community Guidelines</option>
      <option value="Bluesky Community Guidelines">Bluesky Community Guidelines</option>
      <option value="custom">Custom</option>
    </select>
    <input type="text" class="custom-covenant-input" placeholder="Enter custom covenant name"
      style="display: none; margin-top: var(--spacing-sm); width: 100%; flex-basis: 100%;">
  `;
  list.appendChild(newItem);
  document.getElementById('addCovenantBtn').style.display = 'none';
};


document.addEventListener("DOMContentLoaded", () => {
  rbRender();
  loadRulesData();
  document.getElementById('communityRulesLink').addEventListener('input', window.autoSaveData);
  document.getElementById('adaptedFrom').addEventListener('input', window.autoSaveData);
});