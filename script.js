// ===== ÉLÉMENTS DOM =====
const articlesContainer = document.getElementById('articlesContainer');
const addArticleBtn = document.getElementById('addArticleBtn');
const generateBtn = document.getElementById('generateBtn');
const previewSection = document.getElementById('previewSection');
const formSection = document.getElementById('formSection');
const editBtn = document.getElementById('editBtn');
const downloadBtn = document.getElementById('downloadBtn');
const invoiceContainer = document.getElementById('invoiceContainer');

// ===== GESTION DES ARTICLES =====
let articleCount = 1;

// Ajouter un article
addArticleBtn.addEventListener('click', () => {
    articleCount++;
    const articleDiv = document.createElement('div');
    articleDiv.className = 'article-item';
    articleDiv.dataset.index = articleCount;
    articleDiv.innerHTML = `
        <div class="article-row">
            <div class="form-group">
                <label>Nom de l'article</label>
                <input type="text" class="article-name" placeholder="Ex: Veste en cuir" />
            </div>
            <div class="form-group">
                <label>Quantité</label>
                <input type="number" class="article-qty" value="1" min="1" />
            </div>
            <div class="form-group">
                <label>Prix unitaire (FCFA)</label>
                <input type="number" class="article-price" value="0" min="0" step="100" />
            </div>
            <div class="form-group">
                <label>Couleur</label>
                <input type="text" class="article-color" placeholder="Ex: Noir" />
            </div>
            <div class="form-group">
                <label>Description</label>
                <input type="text" class="article-desc" placeholder="Taille, matière..." />
            </div>
            <button type="button" class="btn-remove-article" title="Supprimer">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    articlesContainer.appendChild(articleDiv);

    // Attacher l'événement supprimer au nouveau bouton
    const removeBtn = articleDiv.querySelector('.btn-remove-article');
    removeBtn.addEventListener('click', () => {
        if (document.querySelectorAll('.article-item').length > 1) {
            articleDiv.remove();
        } else {
            alert('Vous devez avoir au moins un article.');
        }
    });
});

// Supprimer un article (gestion des existants)
document.querySelectorAll('.btn-remove-article').forEach(btn => {
    btn.addEventListener('click', function() {
        const parent = this.closest('.article-item');
        if (document.querySelectorAll('.article-item').length > 1) {
            parent.remove();
        } else {
            alert('Vous devez avoir au moins un article.');
        }
    });
});

// ===== GÉNÉRER LA FACTURE =====
generateBtn.addEventListener('click', () => {
    // 1. Récupérer le nom du client
    const clientName = document.getElementById('clientName').value.trim();
    if (!clientName) {
        alert('Veuillez entrer le nom du client.');
        return;
    }

    // 2. Récupérer les articles
    const articleItems = document.querySelectorAll('.article-item');
    const articles = [];
    let hasError = false;

    articleItems.forEach((item, index) => {
        const name = item.querySelector('.article-name').value.trim();
        const qty = parseInt(item.querySelector('.article-qty').value) || 0;
        const price = parseFloat(item.querySelector('.article-price').value) || 0;
        const color = item.querySelector('.article-color').value.trim() || 'Non spécifiée';
        const desc = item.querySelector('.article-desc').value.trim() || '';

        if (!name) {
            alert(`Veuillez nommer l'article n°${index + 1}.`);
            hasError = true;
            return;
        }
        if (qty <= 0) {
            alert(`La quantité de l'article "${name}" doit être supérieure à 0.`);
            hasError = true;
            return;
        }
        if (price <= 0) {
            alert(`Le prix unitaire de l'article "${name}" doit être supérieur à 0.`);
            hasError = true;
            return;
        }

        articles.push({
            name,
            qty,
            price,
            color,
            desc
        });
    });

    if (hasError || articles.length === 0) return;

    // 3. Calculer les totaux
    const totalHT = articles.reduce((sum, art) => sum + art.qty * art.price, 0);
    const tva = totalHT * 0.18; // TVA 18%
    const totalTTC = totalHT + tva;

    // 4. Générer le numéro de facture
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR');
    const invoiceNum = `AZ-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(Math.floor(Math.random()*10000)).padStart(4,'0')}`;

    // 5. Construire le HTML de la facture
    let html = `
        <div class="invoice-header">
            <div>
                <img src="logo/logo-azaratti.png" alt="Azaratti1of1" class="invoice-logo" />
            </div>
            <div class="invoice-company-info">
                <h2>Azaratti1of1</h2>
                <p>Confection & Vente de Vestes</p>
                <p><a href="https://www.azaratti1of1.com">www.azaratti1of1.com</a></p>
                <p><a href="mailto:Contact@azaratti1of1.com">Contact@azaratti1of1.com</a></p>
            </div>
        </div>

        <div class="invoice-client">
            <div>
                <span class="label">Client :</span>
                <span class="value">${clientName}</span>
            </div>
            <div>
                <span class="label">Date :</span>
                <span class="value">${dateStr}</span>
            </div>
            <div>
                <span class="label">Facture n° :</span>
                <span class="value">${invoiceNum}</span>
            </div>
        </div>

        <table class="invoice-table">
            <thead>
                <tr>
                    <th>Article</th>
                    <th>Couleur</th>
                    <th>Description</th>
                    <th>Qté</th>
                    <th>Prix unit.</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
    `;

    articles.forEach(art => {
        const total = art.qty * art.price;
        html += `
            <tr>
                <td><strong>${art.name}</strong></td>
                <td>${art.color}</td>
                <td>${art.desc || '-'}</td>
                <td>${art.qty}</td>
                <td>${art.price.toLocaleString()} FCFA</td>
                <td>${total.toLocaleString()} FCFA</td>
            </tr>
        `;
    });

    html += `
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="5" style="text-align:right; font-weight:600;">Sous-total HT</td>
                    <td>${totalHT.toLocaleString()} FCFA</td>
                </tr>
                <tr>
                    <td colspan="5" style="text-align:right; font-weight:600;">TVA (18%)</td>
                    <td>${tva.toLocaleString()} FCFA</td>
                </tr>
                <tr class="total-row">
                    <td colspan="5" class="total-label">TOTAL TTC</td>
                    <td class="total-amount">${totalTTC.toLocaleString()} FCFA</td>
                </tr>
            </tfoot>
        </table>

        <div class="invoice-footer">
            <p><strong>Merci de votre confiance !</strong></p>
            <p>Azaratti1of1 · Confection & Vente de Vestes</p>
            <div class="footer-links">
                <a href="https://www.azaratti1of1.com">www.azaratti1of1.com</a>
                <a href="mailto:Contact@azaratti1of1.com">Contact@azaratti1of1.com</a>
            </div>
            <p style="margin-top:10px; font-size:0.7rem; color:#999;">
                Facture générée automatiquement · ${dateStr}
            </p>
        </div>
    `;

    // 6. Afficher la facture
    invoiceContainer.innerHTML = html;
    formSection.style.display = 'none';
    previewSection.style.display = 'block';

    // 7. Scroller vers l'aperçu
    previewSection.scrollIntoView({ behavior: 'smooth' });
});

// ===== BOUTON MODIFIER =====
editBtn.addEventListener('click', () => {
    previewSection.style.display = 'none';
    formSection.style.display = 'block';
    document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
});

// ===== BOUTON TÉLÉCHARGER PDF =====
downloadBtn.addEventListener('click', () => {
    const invoiceElement = document.getElementById('invoiceContainer');

    // Afficher un indicateur de chargement
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Génération...';
    downloadBtn.disabled = true;

    // Options de génération PDF
    const opt = {
        margin:        [10, 10, 10, 10],
        filename:      `facture-Azaratti1of1-${new Date().toISOString().slice(0,10)}.pdf`,
        image:         { type: 'jpeg', quality: 0.98 },
        html2canvas:   { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:         { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(invoiceElement).save().then(() => {
        // Rétablir le bouton
        downloadBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Télécharger PDF';
        downloadBtn.disabled = false;
    }).catch((err) => {
        console.error('Erreur PDF:', err);
        alert('Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.');
        downloadBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Télécharger PDF';
        downloadBtn.disabled = false;
    });
});

// ===== VALIDATION DES CHAMPS NUMÉRIQUES =====
// Empêcher les valeurs négatives
document.addEventListener('input', (e) => {
    if (e.target.classList.contains('article-qty') || e.target.classList.contains('article-price')) {
        if (parseFloat(e.target.value) < 0) {
            e.target.value = 0;
        }
    }
});
