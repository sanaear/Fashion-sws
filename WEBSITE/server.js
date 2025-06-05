const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();
const PORT = 3600;

// Configuration de la connexion à la base de données
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'fashion'
});

// Établissement de la connexion à la base de données
connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err.message);
        return;
    }
    console.log('Connecté à la base de données MySQL');
});

// Configuration du middleware pour analyser les corps de requête HTTP
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// You should add the static files to your express app and serve the pictures on your back-end server !! 
app.use(express.static(path.join(__dirname,'public')))
app.use('/static',express.static('public'))

// Serve the main HTML files
// Routes pour les pages HTML
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cart.html'));
});



// Insertion des données dans la table users
app.post('/login', (req, res) => {
    const { znom, zemail, zpwd } = req.body;

    // Validation des champs
    if (!znom || !zemail || !zpwd) {
        res.status(400).send("<h3>Erreur: Tous les champs sont obligatoires</h3>");
        return;
    }

    const request_SQL = "INSERT INTO user (Username, Email, Password) VALUES (?, ?, ?)";
    const params = [znom, zemail, zpwd];

    connection.query(request_SQL, params, (err, results) => {
        if (err) {
            console.error('Erreur d\'exécution de la requête MySQL:', err.message);
            res.status(500).send("<h3>Erreur lors de l'insertion</h3>");
            return;
        }
        res.status(200).send("<h3>Insertion réussie dans la table users</h3>");
    });
});
app.post('/cart', (req, res) => {
    const { id_u, id_p, total, quantity } = req.body;

    // Ajoutez des journaux pour déboguer
    console.log('Reçu du formulaire:', { id_u, id_p, total, quantity });

    // Validation des champs
    if (!total || !quantity || !id_p || !id_u) {
        res.status(400).send("<h3>Erreur: Tous les champs sont obligatoires</h3>");
        return;
    }

    // Vérifiez que le produit existe
    const checkProductSQL = "SELECT COUNT(*) AS count FROM products WHERE Id_P = ?";
    connection.query(checkProductSQL, [id_p], (err, productResults) => {
        if (err) {
            console.error('Erreur d\'exécution de la requête MySQL:', err.message);
            res.status(500).send("<h3>Erreur lors de la vérification du produit</h3>");
            return;
        }

        if (productResults[0].count === 0) {
            res.status(400).send("<h3>Erreur: Produit non trouvé</h3>");
            return;
        }

        // Vérifiez que l'utilisateur existe
        const checkUserSQL = "SELECT COUNT(*) AS count FROM user WHERE Id_User = ?";
        connection.query(checkUserSQL, [id_u], (err, userResults) => {
            if (err) {
                console.error('Erreur d\'exécution de la requête MySQL:', err.message);
                res.status(500).send("<h3>Erreur lors de la vérification de l'utilisateur</h3>");
                return;
            }

            if (userResults[0].count === 0) {
                res.status(400).send("<h3>Erreur: Utilisateur non trouvé</h3>");
                return;
            }

            // Insérez la commande
            const insertSQL = "INSERT INTO commande (Total, Quantité, Product_id, user_id) VALUES (?, ?, ?, ?)";
            const params = [total, quantity, id_p, id_u];
            connection.query(insertSQL, params, (err, results) => {
                if (err) {
                    console.error('Erreur d\'exécution de la requête MySQL:', err.message);
                    res.status(500).send("<h3>Erreur lors de l'insertion</h3>");
                    return;
                }
                res.status(200).send("<h3>Insertion réussie dans la table commandes</h3>");
            });
        });
    });
});
app.listen(PORT, () => {
    console.log(`Le serveur est en cours d'exécution sur le port : ${PORT}`);
});
