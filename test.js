document.addEventListener('DOMContentLoaded', function() {
    
    // =========================================================================
    // 1. DÉCLARATION ET INITIALISATION DES DONNÉES
    // ====================================================================
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'passer123';

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
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(email);
    }

    function checkPassword(password) {
        return password.length >= 8;
    }

    function checkName(name) {
        return name.length >= 2 && /^[A-Za-z\s]+$/.test(name);
    }

    function clearErrors() {
        // Effacer les anciens messages d'erreur
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        // Effacer nos nouveaux messages d'erreur
        document.querySelectorAll('.error-message-custom').forEach(el => {
            el.remove();
        });
        errorMessage.textContent = '';
    }

    // Nouvelle fonction pour afficher les erreurs en rouge sous les champs
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            // Chercher s'il y a déjà un message d'erreur
            let errorElement = field.parentNode.querySelector('.error-message-custom');
            
            // Si pas de message d'erreur, en créer un
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message-custom';
                field.parentNode.appendChild(errorElement);
            }
            
            // Afficher le message en rouge
            errorElement.textContent = message;
            errorElement.style.color = 'red';
            errorElement.style.fontSize = '14px';
            errorElement.style.marginTop = '5px';
            errorElement.style.display = 'block';
            errorElement.style.fontWeight = '500';
        }
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

    

    // =========================================================================
    // 4. GESTION DES ÉVÉNEMENTS
    // =========================================================================
    
    // Désactiver la validation HTML5 par défaut
    if (loginForm) loginForm.setAttribute('novalidate', true);
    if (createForm) createForm.setAttribute('novalidate', true);

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        clearErrors();

        const email = document.getElementById('email-login').value.trim();
        const password = document.getElementById('password-login').value;

        let hasError = false;

        // Validation des champs de connexion
        if (!email) {
            showError('email-login', 'Veuillez saisir votre email');
            hasError = true;
        } else if (!checkEmail(email)) {
            showError('email-login', 'Email invalide');
            hasError = true;
        }

        if (!password) {
            showError('password-login', 'Veuillez saisir votre mot de passe');
            hasError = true;
        }

        if (hasError) return;

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

        // Validation avec messages personnalisés
        if (!nom) {
            showError('nom-compte', 'Veuillez saisir votre nom');
            hasError = true;
        } else if (!checkName(nom)) {
            showError('nom-compte', 'Nom invalide');
            hasError = true;
        }

        if (!prenom) {
            showError('prenom-compte', 'Veuillez saisir votre prénom');
            hasError = true;
        } else if (!checkName(prenom)) {
            showError('prenom-compte', 'Prénom invalide');
            hasError = true;
        }

        if (!email) {
            showError('email-compte', 'Veuillez saisir votre email');
            hasError = true;
        } else if (!checkEmail(email)) {
            showError('email-compte', 'Email invalide');
            hasError = true;
        } else if (profiles.some(p => p.email === email)) {
            showError('email-compte', 'Email déjà utilisé');
            hasError = true;
        }

        if (!password) {
            showError('password-compte', 'Veuillez saisir un mot de passe');
            hasError = true;
        } else if (!checkPassword(password)) {
            showError('password-compte', 'Mot de passe trop court (min 8)');
            hasError = true;
        }

        if (!confirmPassword) {
            showError('confirm-password-compte', 'Veuillez confirmer votre mot de passe');
            hasError = true;
        } else if (password !== confirmPassword) {
            showError('confirm-password-compte', 'Mots de passe différents');
            hasError = true;
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

    showProfiles();
});