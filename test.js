document.addEventListener('DOMContentLoaded', function() {
    
    // =========================================================================
    // 1. DÉCLARATION ET INITIALISATION DES DONNÉES
    // =========================================================================
    const adminEmail = 'admin@otaku.dev';
    const adminPassword = 'sugoimypassword';

    function loadFromLocalStorage(key, defaultValue) {
        const storedData = localStorage.getItem(key);
        return storedData ? JSON.parse(storedData) : defaultValue;
    }

    function saveToLocalStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // Chargement des profils au démarrage. Le tableau 'profiles' est notre base de données.
    let profiles = loadFromLocalStorage('profiles', []);
    let nextId = profiles.length > 0 ? Math.max(...profiles.map(p => p.id)) + 1 : 1;

    // =========================================================================
    // 2. SÉLECTION DES ÉLÉMENTS HTML
    // =========================================================================
    const loginForm = document.getElementById('login-form');
    const loginScreen = document.getElementById('login-screen');
    const adminDashboard = document.getElementById('admin-dashboard');
    const createForm = document.getElementById('create-account-form');
    const tableBody = document.querySelector('#nakama-table tbody');
    const errorMessage = document.getElementById('error-message-global');
    
    // =========================================================================
    // 3. FONCTIONS POUR LA LOGIQUE DU PROJET
    // =========================================================================
    
    function checkEmail(email) {
        return email.length >= 5 && /^'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/.test(email);
    }

    function checkPassword(password) {
        return password.length >= 8;
    }

    function checkName(name) {
        return name.length >= 2 && /^[A-Za-z\s]+$/.test(name);
    }

    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        errorMessage.textContent = '';
    }
    
    // Fonction principale pour afficher les profils dans le tableau
    function showProfiles() {
        tableBody.innerHTML = '';
        
        // Affiche uniquement les profils dont la propriété 'visible' est 'true'
        profiles.filter(profile => profile.visible)
        .forEach(profile => {
            const row = document.createElement('tr');
            row.dataset.id = profile.id;
            
            row.innerHTML = `
    <td data-label="Nom">${profile.nom}</td>
    <td data-label="Prénom">${profile.prenom}</td>
    <td data-label="Email">${profile.email}</td>
    <td data-label="Date de création">${profile.creationDate}</td>
    <td data-label="Statut"><span class="statut-${profile.statut.replace(/\s/g, '-').toLowerCase()}">${profile.statut}</span></td>
    <td data-label="Actions">
        <button class="bouton-action bouton-statut" data-action="toggle">
            ${profile.statut === 'Validé' ? 'Annuler' : 'Valider'}
        </button>
        <button class="bouton-action bouton-supprimer" data-action="delete">
            Supprimer
        </button>
    </td>
`;

            tableBody.appendChild(row);
        });
    }

    function togglePassword(inputId, buttonId) {
        const input = document.getElementById(inputId);
        const button = document.getElementById(buttonId);
        
        if (button && input) {
            button.addEventListener('click', function() {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                button.classList.toggle('fa-eye', !isPassword);
                button.classList.toggle('fa-eye-slash', isPassword);
            });
        }
    }

    // =========================================================================
    // 4. GESTION DES ÉVÉNEMENTS
    // =========================================================================
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        clearErrors();

        const email = document.getElementById('email-login').value;
        const password = document.getElementById('password-login').value;

        if (email === adminEmail && password === adminPassword) {
            loginScreen.classList.add('hidden');
            adminDashboard.classList.remove('hidden');
            showProfiles();
        } else {
            errorMessage.textContent = 'Identifiants incorrects ! ';
        }
    });

    createForm.addEventListener('submit', function(e) {
        e.preventDefault();
        clearErrors();

        const nom = document.getElementById('nom-compte').value.trim();
        const prenom = document.getElementById('prenom-compte').value.trim();
        const email = document.getElementById('email-compte').value.trim();
        const password = document.getElementById('password-compte').value;
        const confirmPassword = document.getElementById('confirm-password-compte').value;
        
        let hasError = false;

        if (!checkName(nom)) {
            document.getElementById('error-nom-compte').textContent = 'Nom invalide'; hasError = true;
        }
        if (!checkName(prenom)) {
            document.getElementById('error-prenom-compte').textContent = 'Prénom invalide'; hasError = true;
        }
        if (!checkEmail(email)) {
            document.getElementById('error-email-compte').textContent = 'Email invalide'; hasError = true;
        }
        if (profiles.some(p => p.email === email)) {
            document.getElementById('error-email-compte').textContent = 'Email déjà utilisé'; hasError = true;
        }
        if (!checkPassword(password)) {
            document.getElementById('error-password-compte').textContent = 'Mot de passe trop court (min 8)'; hasError = true;
        }
        if (password !== confirmPassword) {
            document.getElementById('error-confirm-password-compte').textContent = 'Mots de passe différents'; hasError = true;
        }

        if (!hasError) {
            const newProfile = {
                id: nextId++,
                nom: nom,
                prenom: prenom,
                email: email,
                password: password,
                creationDate: new Date().toISOString().slice(0, 10),
                statut: 'En cours',
                visible: true // Par défaut, un nouveau profil est visible
            };
            
            profiles.push(newProfile);
            saveToLocalStorage('profiles', profiles);
            
            showProfiles();
            createForm.reset();
            
            errorMessage.textContent = 'Profil créé ';
            errorMessage.classList.add('message-reussite');
            setTimeout(() => {
                errorMessage.textContent = '';
                errorMessage.classList.remove('message-reussite');
            }, 3000);
        }
    });
    tableBody.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON') {
            const action = e.target.dataset.action;
            const row = e.target.closest('tr');
            const id = parseInt(row.dataset.id);
            const profile = profiles.find(p => p.id === id);
            
            if (action === 'delete') {
                if (confirm('Supprimer ce profil ?')) {
                    // Au lieu de le supprimer, on le cache
                    profile.visible = false;
                    saveToLocalStorage('profiles', profiles); // Sauvegarde l'état caché
                    showProfiles();
                    errorMessage.textContent = 'Profil supprimé (caché) !';
                    errorMessage.classList.add('message-reussite');
                    setTimeout(() => {
                        errorMessage.textContent = '';
                        errorMessage.classList.remove('message-reussite');
                    }, 2000);
                }
            }
            
            if (action === 'toggle') {
                profile.statut = profile.statut === 'Validé' ? 'En cours' : 'Validé';
                saveToLocalStorage('profiles', profiles);
                showProfiles();
                errorMessage.textContent = 'Statut changé !';
                errorMessage.classList.add('message-reussite');
                setTimeout(() => {
                    errorMessage.textContent = '';
                    errorMessage.classList.remove('message-reussite');
                }, 2000);
            }
        }
    });

    // =========================================================================
    // 5. INITIALISATION
    // =========================================================================
    togglePassword('password-login', 'show-password-login');
    togglePassword('password-compte', 'show-password-create');
    togglePassword('confirm-password-compte', 'show-password-confirm');

    showProfiles();
});