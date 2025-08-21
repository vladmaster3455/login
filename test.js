const predefinedUsers = [
    { email: "admin@example.com", password: "admin123" },
    { email: "user1@example.com", password: "password1" },
    { email: "user2@example.com", password: "password2" }
];

// Tableau pour stocker les nouveaux utilisateurs créés
let createdUsers = loadUsersFromStorage();

// Fonctions pour gérer le localStorage
function saveUsersToStorage() {
    try {
        localStorage.setItem('createdUsers', JSON.stringify(createdUsers));
    } catch (error) {
        console.warn('localStorage non supporté:', error);
    }
}

function loadUsersFromStorage() {
    try {
        const stored = localStorage.getItem('createdUsers');
        if (stored) {
            return JSON.parse(stored).map(user => ({
                ...user,
                createdAt: new Date(user.createdAt)
            }));
        }
    } catch (error) {
        console.warn('Erreur lors du chargement depuis localStorage:', error);
    }
    return [];
}

// Expression régulière pour valider l'email
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Fonction pour valider l'email
function validateEmail(email) {
    return emailRegex.test(email);
}

// Fonction pour formater la date et l'heure
function formatDateTime(date) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    return date.toLocaleDateString('fr-FR', options);
}

// Gestion de la connexion
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginError = document.getElementById('loginError');

    // Vérifier les identifiants
    const validUser = predefinedUsers.find(user =>
        user.email === email && user.password === password
    );

    if (validUser) {
        // Connexion réussie
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('homePage').classList.remove('hidden');
        loginError.style.display = 'none';
    } else {
        // Connexion échouée
        loginError.style.display = 'block';
    }
});

// Gestion du formulaire d'ajout d'utilisateur
document.getElementById('userForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Reset des erreurs
    document.querySelectorAll('.error').forEach(error => error.style.display = 'none');

    let isValid = true;

    // Validation du nom complet
    if (!fullName) {
        document.getElementById('nameError').style.display = 'block';
        isValid = false;
    }

    // Validation de l'email
    if (!validateEmail(email)) {
        document.getElementById('emailError').style.display = 'block';
        isValid = false;
    }

    // Validation du mot de passe
    if (!password) {
        document.getElementById('passwordError').style.display = 'block';
        isValid = false;
    }

    // Validation de la confirmation du mot de passe
    if (password !== confirmPassword) {
        document.getElementById('confirmError').style.display = 'block';
        isValid = false;
    }

    if (isValid) {
        // Créer un nouvel utilisateur
        const newUser = {
            id: Date.now(),
            fullName: fullName,
            email: email,
            createdAt: new Date(),
            disabled: false
        };

        createdUsers.push(newUser);
        saveUsersToStorage(); // Sauvegarder dans localStorage
        displayUsers();

        // Reset du formulaire
        document.getElementById('userForm').reset();
    }
});

// Fonction pour afficher les utilisateurs
function displayUsers() {
    const usersContainer = document.getElementById('users');
    usersContainer.innerHTML = '';

    createdUsers.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = `user-item ${user.disabled ? 'disabled' : ''}`;
        userDiv.innerHTML = `
                    <div class="user-info">
                        <h3>${user.fullName}</h3>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Créé le:</strong> ${formatDateTime(user.createdAt)}</p>
                    </div>
                    <div class="user-actions">
                        <button class="btn btn-small ${user.disabled ? 'btn-success' : 'btn-warning'}" 
                                onclick="toggleUser(${user.id})">
                            ${user.disabled ? 'Activer' : 'Désactiver'}
                        </button>
                        <button class="btn btn-small btn-danger" onclick="deleteUser(${user.id})">
                            Supprimer
                        </button>
                    </div>
                `;
        usersContainer.appendChild(userDiv);
    });
}

// Fonction pour activer/désactiver un utilisateur
function toggleUser(userId) {
    const user = createdUsers.find(u => u.id === userId);
    if (user) {
        user.disabled = !user.disabled;
        saveUsersToStorage(); // Sauvegarder dans localStorage
        displayUsers();
    }
}

// Fonction pour supprimer un utilisateur
function deleteUser(userId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        createdUsers = createdUsers.filter(u => u.id !== userId);
        saveUsersToStorage(); // Sauvegarder dans localStorage
        displayUsers();
    }
}


// Charger et afficher les utilisateurs au chargement de la page
document.addEventListener('DOMContentLoaded', function () {
    if (createdUsers.length > 0) {
        displayUsers();
    }
});