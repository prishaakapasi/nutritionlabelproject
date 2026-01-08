        const dropdown = document.getElementById('myDropdown');
        const otherInputContainer = document.getElementById('otherInputContainer');
        const otherText = document.getElementById('otherText');
        const saveCategory = document.getElementById('saveCategory');
        const addModuleBtn = document.getElementById('addModuleBtn');
        const newModuleContainer = document.getElementById('newModuleContainer');
        const newModuleText = document.getElementById('newModuleText');
        const saveModule = document.getElementById('saveModule');
        const cancelModule = document.getElementById('cancelModule');
        const modulesContainer = document.getElementById('modulesContainer');

        dropdown.addEventListener('change', function() {
            if (this.value === 'other') {
                otherInputContainer.style.display = 'block';
                otherText.focus();
            } else {
                otherInputContainer.style.display = 'none';
                otherText.value = '';
            }
        });
        saveCategory.addEventListener('click', function() {
            const newCategory = otherText.value.trim();
            if (newCategory) {
                const newOption = document.createElement('option');
                newOption.value = newCategory.toLowerCase().replace(/\s+/g, '-');
                newOption.textContent = newCategory;
                newOption.selected = true;
                const otherOption = dropdown.querySelector('option[value="other"]');
                dropdown.insertBefore(newOption, otherOption);
                
                otherInputContainer.style.display = 'none';
                otherText.value = '';
            }
        });

        addModuleBtn.addEventListener('click', function() {
            newModuleContainer.style.display = 'block';
            newModuleText.focus();
        });

        saveModule.addEventListener('click', function() {
            const newModule = newModuleText.value.trim();
            if (newModule) {
                const newButton = document.createElement('button');
                newButton.className = 'module-btn';
                newButton.textContent = newModule;

                modulesContainer.insertBefore(newButton, addModuleBtn);
                
                newModuleContainer.style.display = 'none';
                newModuleText.value = '';
            }
        });
        cancelModule.addEventListener('click', function() {
            newModuleContainer.style.display = 'none';
            newModuleText.value = '';
        });

        otherText.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveCategory.click();
            }
        });

        newModuleText.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveModule.click();
            }
        });
 