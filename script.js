// Firebase SDK'lary
// NOT: Bu import'lar sadece bir sunucu (mesela "Live Server") üzerinden çalışır.
// Doğrudan file:///... olarak açıldığında ÇALIŞMAZ ve boş ekran alırsınız.
let initializeApp, getAuth, signInAnonymously, signInWithCustomToken, getFirestore, doc, onSnapshot, setDoc;
try {
    const appModule = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
    initializeApp = appModule.initializeApp;

    const authModule = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
    getAuth = authModule.getAuth;
    signInAnonymously = authModule.signInAnonymously;
    signInWithCustomToken = authModule.signInWithCustomToken;

    const firestoreModule = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
    getFirestore = firestoreModule.getFirestore;
    doc = firestoreModule.doc;
    onSnapshot = firestoreModule.onSnapshot;
    setDoc = firestoreModule.setDoc;
} catch (e) {
    console.error("Firebase SDK'ları yüklenemedi. Sayfanın 'file://' üzerinden değil, bir sunucu (örn: Live Server) üzerinden açıldığından emin olun.", e);
}


// DOM Elementleri
const sidebar = document.getElementById('products-sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const purchaseOptionsList = document.getElementById('purchase-options-list');
const purchaseCategoryTitle = document.getElementById('purchase-category-title');

// Modallar
const infoModal = document.getElementById('info-modal');
const confirmationModal = document.getElementById('confirmation-modal');

// Modal düwmeleri
const closeInfoModalButton = document.getElementById('close-info-modal');
const infoButton = document.getElementById('info-button');
const cancelConfirmationButton = document.getElementById('cancel-confirmation');
const proceedPaymentButton = document.getElementById('proceed-payment');

// Modal içerikleri
const infoModalTitle = document.getElementById('info-modal-title');
const infoModalDescription = document.getElementById('info-modal-description');
const confirmationLoader = document.getElementById('confirmation-loader');
const confirmationContent = document.getElementById('confirmation-content');
const confirmationError = document.getElementById('confirmation-error');

// Bakiye Modalı DOM elementleri
const balanceModal = document.getElementById('balance-modal');
const openBalanceModalButton = document.getElementById('open-balance-modal');
const closeBalanceModalButton = document.getElementById('close-balance-modal');

let currentProductKey = null;
let currentCurrency = 'TMT';

const conversionRates = {
    TMT: 1,
    USDT: 18.5 // 1 USDT = 18.5 TMT Bakiye (Hesap makinesi için)
};

// productData (İkon URL'leri ile)
const productData = {
    stars: {
        title: 'Telegram Stars',
        description: 'Kanallaryňyza ýa-da toparlaryňyza goldaw bermek üçin Telegram Stars satyn alyň. Bu, kanalyňyzyň ösmegine we täze mümkinçilikleri açmagyna kömek eder.',
        icon: 'https://www.yyldyz.store/_next/image?url=%2Fjtns%2Fstar.png&w=1920&q=75',
        options: [
            { amount: '50 Stars', price: 22.00 }, { amount: '100 Stars', price: 44.00 }, { amount: '150 Stars', price: 60.00 },
            { amount: '200 Stars', price: 80.00 }, { amount: '250 Stars', price: 95.00 }, { amount: '300 Stars', price: 115.00 },
            { amount: '350 Stars', price: 130.00 }, { amount: '400 Stars', price: 150.00 }, { amount: '450 Stars', price: 165.00 },
            { amount: '500 Stars', price: 185.00 }, { amount: '600 Stars', price: 205.00 }, { amount: '700 Stars', price: 245.00 },
            { amount: '800 Stars', price: 275.00 }, { amount: '900 Stars', price: 315.00 }, { amount: '1000 Stars', price: 345.00 }
        ],
        inputType: 'username',
        inputPlaceholder: '@tg_username'
    },
    telegram_premium: {
        title: 'Telegram Premium',
        description: 'Telegram Premium abunalygyny satyn alyp, goşmaça funksiýalardan peýdalanyň: uly faýllary ýükläň, çalt indiriň, stikerleri we reaksiýalary ulanyň.',
        icon: 'https://www.yyldyz.store/_next/image?url=%2Fjtns%2Ftgprem.png&w=1920&q=75',
        options: [
            { amount: '1 Aý', price: 80.00 },
            { amount: '3 Aý', price: 270.00 },
            { amount: '6 Aý', price: 360.00 }
        ],
        inputType: 'username',
        inputPlaceholder: '@tg_username'
    },
    pubg_uc: {
        title: 'PUBG Mobile UC',
        description: 'Oýun içi satyn alymlar üçin PUBG Mobile UC balansyňyzy dolduryň. UC bilen täze eşikler, ýaraglar we "Royale Pass" satyn alyp bilersiňiz.',
        icon: 'https://www.yyldyz.store/_next/image?url=%2Fjtns%2Fuc.png&w=1920&q=75',
        options: [
            { amount: '10 UC', price: 7.50 }, { amount: '30 UC', price: 13.00 }, { amount: '60 UC', price: 20.00 },
            { amount: '120 UC', price: 40.00 }, { amount: '180 UC', price: 60.00 }, { amount: '240 UC', price: 80.00 },
            { amount: '325 UC', price: 95.00 }, { amount: '385 UC', price: 115.00 }, { amount: '445 UC', price: 135.00 },
            { amount: '505 UC', price: 155.00 }, { amount: '565 UC', price: 175.00 }, { amount: '660 UC', price: 190.00 },
            { amount: '720 UC', price: 210.00 }, { amount: '780 UC', price: 230.00 }, { amount: '840 UC', price: 250.00 },
            { amount: '900 UC', price: 270.00 }, { amount: '985 UC', price: 285.00 }, { amount: '1045 UC', price: 305.00 },
            { amount: '1105 UC', price: 325.00 }, { amount: '1165 UC', price: 345.00 }, { amount: '1225 UC', price: 365.00 },
            { amount: '1320 UC', price: 380.00 }, { amount: '1380 UC', price: 400.00 }, { amount: '1440 UC', price: 420.00 },
            { amount: '1500 UC', price: 440.00 }, { amount: '1560 UC', price: 460.00 }, { amount: '1800 UC', price: 480.00 },
            { amount: '3850 UC', price: 970.00 }, { amount: '8100 UC', price: 1850.00 }
        ],
        inputType: 'text',
        inputPlaceholder: 'PUBG Oýunçy IDňizi giriziň'
    },
    clash_royale: {
        title: 'Clash Royale Pass & Gems',
        description: 'Clash Royale oýny üçin "Diamond Pass" ýa-da "Gems" (almaz) satyn alyň. Sargytyňyz üçin oýunçy tegiňizi giriziň.',
        icon: 'https://www.yyldyz.store/_next/image?url=%2Fjtns%2Froyale-gem.png&w=1920&q=75', // Varsayılan ikon
        options: [
            { amount: 'Diamond Pass', price: 300.00, iconUrl: 'https://www.yyldyz.store/_next/image?url=%2Fjtns%2Fdiamond-pass.png&w=1920&q=75' },
            { amount: '80 Gems', price: 25.00 },
            { amount: '500 Gems', price: 120.00 },
            { amount: '1200 Gems', price: 230.00 },
            { amount: '2500 Gems', price: 460.00 },
            { amount: '6500 Gems', price: 1100.00 },
            { amount: '14000 Gems', price: 2150.00 }
        ],
        inputType: 'text',
        inputPlaceholder: 'Oýunçy Tegiňizi giriziň (#TAG)'
    },
    clash_of_clans: {
        title: 'Clash of Clans Pass & Gems',
        description: 'Clash of Clans oýny üçin "Gold Pass" ýa-da "Gems" (almaz) satyn alyň. Sargytyňyz üçin oýunçy tegiňizi giriziň.',
        icon: 'https://www.yyldyz.store/_next/image?url=%2Fjtns%2Fclash-gem.png&w=1920&q=75', // Varsayılan ikon
        options: [
            { amount: 'Gold Pass', price: 170.00, iconUrl: 'https://www.yyldyz.store/_next/image?url=%2Fjtns%2Fgold-pass.png&w=1920&q=75' },
            { amount: '80 Gems', price: 25.00 },
            { amount: '250 Gems', price: 70.00 },
            { amount: '500 Gems', price: 115.00 },
            { amount: '1200 Gems', price: 225.00 },
            { amount: '1850 Gems', price: 340.00 },
            { amount: '2500 Gems', price: 450.00 },
            { amount: '6500 Gems', price: 1100.00 },
            { amount: '14000 Gems', price: 2175.00 }
        ],
        inputType: 'text',
        inputPlaceholder: 'Oýunçy Tegiňizi giriziň (#TAG)'
    },
    chatgpt: {
        title: 'ChatGPT Plus & Pro',
        description: 'ChatGPT üçin "Plus" ýa-da "Pro" abunalygyny satyn alyň. Sargyt etmek üçin hasabyňyzyň e-poçta adresini giriziň.',
        icon: 'https://www.yyldyz.store/_next/image?url=%2Fjtns%2Fgpt.png&w=1920&q=75',
        options: [
            { amount: 'Plus', price: 450.00 },
            { amount: 'Pro', price: 4250.00 }
        ],
        inputType: 'email',
        inputPlaceholder: 'ChatGPT e-poçtaňyzy giriziň'
    }
};

// --- Firebase Entegrasyonu ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';
let firebaseConfig = {};
try {
    firebaseConfig = JSON.parse(firebaseConfigStr);
} catch (e) {
    console.error("Firebase config parse error:", e);
}
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app, auth, db;
let userId = null;

// Sadece Firebase SDK'ları başarıyla yüklendiyse başlat
if (typeof initializeApp === 'function') {
    if (Object.keys(firebaseConfig).length > 0) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } else {
        console.warn("Firebase config is not available.");
    }
}

// Bakiye dinleyicisini başlatan fonksiyon
function setupBalanceListener(uid) {
    const balanceValueEl = document.getElementById('balance-value');
    if (!db || !uid) {
        balanceValueEl.textContent = 'N/A';
        return;
    }
    
    const userBalanceRef = doc(db, `artifacts/${appId}/users/${uid}/balance`);

    onSnapshot(userBalanceRef, (docSnap) => {
        if (docSnap.exists()) {
            const balanceData = docSnap.data();
            const tmtBalance = balanceData.tmt || 0;
            balanceValueEl.textContent = tmtBalance.toFixed(2);
        } else {
            console.log("Kullanıcı için bakiye dökümanı bulunamadı. Sıfır bakiye ile oluşturuluyor.");
            balanceValueEl.textContent = "0.00";
            setDoc(userBalanceRef, { tmt: 0 }).catch(err => console.error("Bakiye dökümanı oluşturulurken hata:", err));
        }
    }, (error) => {
        console.error("Bakiye dinlenirken hata oluştu:", error);
        balanceValueEl.textContent = 'Error';
    });
}

// Kullanıcı kimliğini doğrula ve dinleyiciyi başlat
async function authenticateAndListen() {
    if (!auth) {
        console.warn("Auth başlatılmadı, kimlik doğrulama atlanıyor.");
        return;
    }
    try {
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }
        userId = auth.currentUser.uid;
        console.log("Kullanıcı doğrulandı, UID:", userId);
        setupBalanceListener(userId);
    } catch (error) {
        console.error("Firebase kimlik doğrulama hatası:", error);
    }
}

// --- Temel Fonksiyonlar ---
function removeAllUsernameInputs() {
    document.querySelectorAll('.username-input-container').forEach(el => el.remove());
}

function handleOptionClick(optionButton, option, productKey, index) {
    removeAllUsernameInputs();
    purchaseOptionsList.querySelectorAll('.purchase-option').forEach(btn => btn.classList.remove('selected'));
    optionButton.classList.add('selected');

    const product = productData[productKey];
    if (product.inputType) {
        const inputContainer = document.createElement('div');
        inputContainer.className = 'username-input-container p-4 bg-slate-800 rounded-lg mt-2';
        
        inputContainer.innerHTML = `
            <div class="flex items-center gap-3">
                <input type="${product.inputType}" placeholder="${product.inputPlaceholder}" class="w-full bg-slate-700 text-white rounded-md px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-accent">
                <button class="al-button hidden bg-accent text-white font-semibold px-6 py-2 rounded-md whitespace-nowrap">Al</button>
            </div>
        `;
        optionButton.insertAdjacentElement('afterend', inputContainer);

        const inputField = inputContainer.querySelector('input');
        const alButton = inputContainer.querySelector('.al-button');

        inputField.addEventListener('input', () => {
            if (inputField.value.trim().length > 0) {
                alButton.classList.remove('hidden');
            } else {
                alButton.classList.add('hidden');
            }
        });
        
        alButton.addEventListener('click', () => {
            showConfirmationModal(inputField.value.trim(), option, productKey);
        });
    }
}

function updatePurchaseView(productKey) {
    currentProductKey = productKey;
    const product = productData[productKey];
    if (!product) return;
    
    purchaseCategoryTitle.textContent = product.title;
    purchaseOptionsList.innerHTML = ''; 

    product.options.forEach((option, index) => {
        const optionButton = document.createElement('button');
        optionButton.className = 'purchase-option w-full p-4 flex justify-between items-center text-left';
        
        const priceInTMT = option.price;
        const convertedPrice = priceInTMT / conversionRates[currentCurrency];

        // Yeni İkon Mantığı
        let iconHtml;
        let iconUrl = option.iconUrl || product.icon; // Önce seçeneğin kendi ikonuna bak, yoksa varsayılan ürün ikonunu al

        iconHtml = `<img src="${iconUrl}" class="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="${option.amount}">`;

        optionButton.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="w-8 h-8 text-white flex-shrink-0">${iconHtml}</div>
                <p class="font-semibold text-lg text-white">${option.amount}</p>
            </div>
            <p class="text-md text-gray-300 font-medium">${convertedPrice.toFixed(2)} ${currentCurrency}</p>
        `;
        
        optionButton.style.opacity = 0;
        optionButton.style.animation = `item-fade-in 0.4s ease-out forwards ${index * 0.07}s`;

        optionButton.dataset.price = option.price;
        optionButton.addEventListener('click', () => handleOptionClick(optionButton, option, productKey, index));
        purchaseOptionsList.appendChild(optionButton);
    });
}

 function setActiveProduct(productKey) {
    removeAllUsernameInputs();
    updatePurchaseView(productKey);
    const allNavButtons = document.querySelectorAll('.open-purchase-button');
    allNavButtons.forEach(btn => {
        btn.classList.remove('bg-accent', 'text-white', 'active');
        btn.classList.add('text-gray-300');
    });
    
    const buttonsToActivate = document.querySelectorAll(`.open-purchase-button[data-product="${productKey}"]`);
    buttonsToActivate.forEach(activeBtn => {
        if (!activeBtn.classList.contains('mobile-nav-button')) {
            activeBtn.classList.add('bg-accent', 'text-white');
            activeBtn.classList.remove('text-gray-300');
        } else {
            activeBtn.classList.add('active');
        }
    });
}

function openInfoModal() {
    if (!currentProductKey) return;
    const product = productData[currentProductKey];
    infoModalTitle.textContent = product.title;
    infoModalDescription.textContent = product.description;
    infoModal.classList.remove('hidden');
}

function closeInfoModal() {
    infoModal.classList.add('hidden');
}

function closeConfirmationModal() {
     confirmationModal.classList.add('hidden');
}

function showConfirmationModal(inputValue, option, productKey) {
    confirmationModal.classList.remove('hidden');
    confirmationContent.classList.add('hidden');
    confirmationError.classList.add('hidden');
    proceedPaymentButton.disabled = true;

    const product = productData[productKey];
    const priceInTMT = option.price;
    const convertedPrice = priceInTMT / conversionRates[currentCurrency];
    
    document.getElementById('confirm-product-name').textContent = product.title;
    document.getElementById('confirm-quantity').textContent = option.amount;
    document.getElementById('confirm-total').textContent = `${convertedPrice.toFixed(2)} ${currentCurrency}`;

    const userInfoLabel = document.getElementById('confirm-user-info-label');
    const userInfoText = document.getElementById('confirm-user-info');
    const profilePic = document.getElementById('confirm-profile-pic');

    if (product.inputType === 'username') {
        confirmationLoader.style.display = 'flex';
        userInfoLabel.textContent = 'Username:';
        profilePic.style.display = 'block';

        fetchTelegramUserData(inputValue)
            .then(userData => {
                profilePic.src = userData.profilePic;
                userInfoText.textContent = userData.displayName;
                confirmationContent.classList.remove('hidden');
                proceedPaymentButton.disabled = false;
            })
            .catch(error => {
                confirmationError.classList.remove('hidden');
            })
            .finally(() => {
                confirmationLoader.style.display = 'none';
            });
    } 
    else {
        confirmationLoader.style.display = 'none';
        
        if (productKey === 'pubg_uc') {
            userInfoLabel.textContent = 'Oýunçy ID:';
        } else if (productKey === 'clash_royale' || productKey === 'clash_of_clans') {
            userInfoLabel.textContent = 'Oýunçy Tegi:';
        } else if (productKey === 'chatgpt') {
            userInfoLabel.textContent = 'E-poçta:';
        } else {
            userInfoLabel.textContent = 'Maglumat:';
        }
        
        userInfoText.textContent = inputValue;
        profilePic.style.display = 'none'; 
        
        confirmationContent.classList.remove('hidden');
        proceedPaymentButton.disabled = false;
    }
}

function fetchTelegramUserData(username) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const cleanUsername = username.replace('@', '');
            if (!cleanUsername) {
                reject('Ulanyjy ady boş bolmaly däl');
                return;
            }
            
            if (cleanUsername.toLowerCase() === 'stormreaper') {
                resolve({
                    displayName: 'Storm Reaper',
                    profilePic: 'https://placehold.co/64x64/7c3aed/ffffff?text=SR'
                });
            } else {
                resolve({
                    displayName: cleanUsername,
                    profilePic: `https://placehold.co/64x64/4a5568/ffffff?text=${cleanUsername.charAt(0).toUpperCase()}`
                });
            }
        }, 1500);
    });
}


// --- Bakiye Yükleme Modalı (Hesap Makinesi) ---

function setupBalanceCalculator() {
    const rows = document.querySelectorAll('.balance-calculator-row');
    const usdtRate = conversionRates.USDT; // 18.5

    rows.forEach(row => {
        const beryanInput = row.querySelector('input[name="beryan"]');
        const alyanInput = row.querySelector('input[name="alyan"]');
        const rate = parseFloat(row.dataset.rate);
        const isUsdt = row.querySelector('span.font-semibold').textContent === 'USDT';

        beryanInput.addEventListener('input', () => {
            const beryanValue = parseFloat(beryanInput.value);
            if (isNaN(beryanValue) || beryanValue <= 0) {
                alyanInput.value = '';
                return;
            }

            let alyanValue;
            if (isUsdt) {
                // Berýän (USDT) -> Alýan (Balans TMT)
                // 1 USDT = 18.5 Bakiye. Komisyon (rate) 0.
                alyanValue = (beryanValue * usdtRate) / (1 + rate); // (1 + rate) şimdilik 1
            } else {
                // DÜZELTME: Berýän (TMT) -> Alýan (Balans TMT)
                // 90 TMT / (1 + 0.10) = 81.81...
                alyanValue = beryanValue / (1 + rate);
            }
            alyanInput.value = alyanValue.toFixed(2);
        });

        alyanInput.addEventListener('input', () => {
            const alyanValue = parseFloat(alyanInput.value);
            if (isNaN(alyanValue) || alyanValue <= 0) {
                beryanInput.value = '';
                return;
            }

            let beryanValue;
            if (isUsdt) {
                // Alýan (Balans TMT) -> Berýän (USDT)
                beryanValue = (alyanValue * (1 + rate)) / usdtRate;
            } else {
                // DÜZELTME: Alýan (Balans TMT) -> Berýän (TMT)
                // 81.82 Bakiye * (1 + 0.10) = 90
                beryanValue = alyanValue * (1 + rate);
            }
            beryanInput.value = beryanValue.toFixed(2);
        });
    });
}

// Bakiye Modalı Kapatma/Açma Fonksiyonları
function openBalanceModal() {
    if (balanceModal) balanceModal.classList.remove('hidden');
}

function closeBalanceModal() {
    if (balanceModal) balanceModal.classList.add('hidden');
}

// --- Event Listeners (Olay Dinleyiciler) ---
if (infoButton) infoButton.addEventListener('click', openInfoModal);
if (closeInfoModalButton) closeInfoModalButton.addEventListener('click', closeInfoModal);
if (infoModal) infoModal.addEventListener('click', (e) => { if (e.target === infoModal) closeInfoModal(); });

if (cancelConfirmationButton) cancelConfirmationButton.addEventListener('click', closeConfirmationModal);
if (confirmationModal) confirmationModal.addEventListener('click', (e) => { if (e.target === confirmationModal) closeConfirmationModal(); });

// Bakiye Modalı Event Listeners
if (openBalanceModalButton) openBalanceModalButton.addEventListener('click', openBalanceModal);
if (closeBalanceModalButton) closeBalanceModalButton.addEventListener('click', closeBalanceModal);
if (balanceModal) balanceModal.addEventListener('click', (e) => { if (e.target === balanceModal) closeBalanceModal(); });

document.querySelectorAll('.open-purchase-button').forEach(button => {
    button.addEventListener('click', () => {
        setActiveProduct(button.dataset.product);
    });
});

if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('is-expanded');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // DÜZELTME: Başlangıçta "Stars" bölümünü seçili getir
    setActiveProduct('stars'); 
    
    if (typeof authenticateAndListen === 'function') {
        authenticateAndListen(); // Firebase'i başlat
    }
    setupBalanceCalculator(); // Hesap makinesini başlat
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeInfoModal();
        closeConfirmationModal();
        closeBalanceModal(); // ESC ile bakiye modalını da kapat
    }
});

const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => {
            t.classList.remove('active');
            t.classList.add('text-gray-400', 'hover:bg-slate-700');
        });
        tab.classList.add('active');
        tab.classList.remove('text-gray-400', 'hover:bg-slate-700');

        const newCurrency = tab.dataset.currency;
        if (newCurrency && currentCurrency !== newCurrency) {
            currentCurrency = newCurrency;
            if (currentProductKey) {
                setActiveProduct(currentProductKey);
            }
        }
    });
});
