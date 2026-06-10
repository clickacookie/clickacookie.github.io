// game.js — Complete Cookie Clicker Game Logic
// Optimized version with reduced UI flickering
// ============================================================

(function() {
    // ========== GAME STATE ==========
    let cookies = 0;
    let totalCookiesBaked = 0;
    let clickPower = 1;
    let globalMultiplier = 1;
    let offlineProduction = 0;
    let frenzyMultiplier = 1;
    let frenzyEndTime = 0;
    let lastTimestamp = 0;
    let saveInterval = null;
    let productionInterval = null;
    let goldenCookieTimeout = null;
    let goldenCookieVisible = false;

    // Cache for achievements strip to prevent unnecessary re-renders
    let lastAchievementsHash = '';
    let updateUIPending = false;
    let lastUIUpdateTime = 0;
    const UI_UPDATE_INTERVAL = 100; // Update UI at most every 100ms

    // Buildings data
    const buildings = [
        { id: 'cursor', name: 'Cursor', baseCost: 15, baseCps: 0.1, count: 0, icon: '🖱️' },
        { id: 'grandma', name: 'Grandma', baseCost: 100, baseCps: 1, count: 0, icon: '👵' },
        { id: 'farm', name: 'Farm', baseCost: 1100, baseCps: 8, count: 0, icon: '🌾' },
        { id: 'mine', name: 'Mine', baseCost: 12000, baseCps: 47, count: 0, icon: '⛏️' },
        { id: 'factory', name: 'Factory', baseCost: 130000, baseCps: 260, count: 0, icon: '🏭' },
        { id: 'bank', name: 'Bank', baseCost: 1400000, baseCps: 1400, count: 0, icon: '🏦' },
        { id: 'temple', name: 'Temple', baseCost: 20000000, baseCps: 7800, count: 0, icon: '🏛️' },
        { id: 'wizard', name: 'Wizard Tower', baseCost: 330000000, baseCps: 44000, count: 0, icon: '🧙' },
        { id: 'shipment', name: 'Shipment', baseCost: 5100000000, baseCps: 260000, count: 0, icon: '🚀' },
        { id: 'alchemy', name: 'Alchemy Lab', baseCost: 75000000000, baseCps: 1600000, count: 0, icon: '🧬' },
        { id: 'portal', name: 'Portal', baseCost: 1000000000000, baseCps: 10000000, count: 0, icon: '🌀' },
        { id: 'time', name: 'Time Machine', baseCost: 14000000000000, baseCps: 65000000, count: 0, icon: '⏳' },
        { id: 'antimatter', name: 'Antimatter', baseCost: 170000000000000, baseCps: 430000000, count: 0, icon: '✨' },
        { id: 'prism', name: 'Prism', baseCost: 2100000000000000, baseCps: 2900000000, count: 0, icon: '🌌' }
    ];

    // Upgrades data
    const upgrades = [
        { id: 'upg_click1', name: 'Plastic Mouse', desc: 'Click power +1', type: 'click', value: 1, cost: 100, purchased: false, icon: '🖱️', requiredCookies: 100 },
        { id: 'upg_click2', name: 'Iron Mouse', desc: 'Click power +2', type: 'click', value: 2, cost: 1000, purchased: false, icon: '🖱️', requiredCookies: 1000, requires: 'upg_click1' },
        { id: 'upg_click3', name: 'Titanium Mouse', desc: 'Click power +3', type: 'click', value: 3, cost: 50000, purchased: false, icon: '🖱️', requiredCookies: 50000, requires: 'upg_click2' },
        { id: 'upg_mult1', name: 'Cookie Multiplier', desc: 'Global production +10%', type: 'multiplier', value: 0.1, cost: 1000, purchased: false, icon: '✨', requiredCookies: 1000 },
        { id: 'upg_mult2', name: 'Cookie Multiplier II', desc: 'Global production +20%', type: 'multiplier', value: 0.2, cost: 100000, purchased: false, icon: '✨', requiredCookies: 100000, requires: 'upg_mult1' },
        { id: 'upg_mult3', name: 'Cookie Multiplier III', desc: 'Global production +30%', type: 'multiplier', value: 0.3, cost: 10000000, purchased: false, icon: '✨', requiredCookies: 10000000, requires: 'upg_mult2' },
        { id: 'upg_cursor1', name: 'Reinforced Finger', desc: 'Cursors produce 2x', type: 'building', buildingId: 'cursor', value: 2, cost: 500, purchased: false, icon: '🖱️', requiredCookies: 500 },
        { id: 'upg_cursor2', name: 'Carpal Tunnel Prevention', desc: 'Cursors produce 2x', type: 'building', buildingId: 'cursor', value: 2, cost: 10000, purchased: false, icon: '🖱️', requiredCookies: 10000, requires: 'upg_cursor1' },
        { id: 'upg_grandma1', name: 'Forwards from Grandma', desc: 'Grandmas produce 2x', type: 'building', buildingId: 'grandma', value: 2, cost: 5000, purchased: false, icon: '👵', requiredCookies: 5000 },
        { id: 'upg_grandma2', name: 'Steel-plated Rolling Pins', desc: 'Grandmas produce 2x', type: 'building', buildingId: 'grandma', value: 2, cost: 100000, purchased: false, icon: '👵', requiredCookies: 100000, requires: 'upg_grandma1' },
        { id: 'upg_farm1', name: 'Cookie Trees', desc: 'Farms produce 2x', type: 'building', buildingId: 'farm', value: 2, cost: 50000, purchased: false, icon: '🌾', requiredCookies: 50000 },
        { id: 'upg_farm2', name: 'Squirrel Workers', desc: 'Farms produce 2x', type: 'building', buildingId: 'farm', value: 2, cost: 1000000, purchased: false, icon: '🌾', requiredCookies: 1000000, requires: 'upg_farm1' },
        { id: 'upg_mine1', name: 'Pulsar Sprinklers', desc: 'Mines produce 2x', type: 'building', buildingId: 'mine', value: 2, cost: 500000, purchased: false, icon: '⛏️', requiredCookies: 500000 },
        { id: 'upg_factory1', name: 'Flat-screen Fertilizer', desc: 'Factories produce 2x', type: 'building', buildingId: 'factory', value: 2, cost: 5000000, purchased: false, icon: '🏭', requiredCookies: 5000000 },
        { id: 'upg_bank1', name: 'Compound Interest', desc: 'Banks produce 2x', type: 'building', buildingId: 'bank', value: 2, cost: 50000000, purchased: false, icon: '🏦', requiredCookies: 50000000 }
    ];

    // Achievements data
    const achievements = [
        { id: 'ach_100', name: 'Cookie Novice', desc: 'Bake 100 cookies', icon: '🍪', requirement: { type: 'total', value: 100 }, unlocked: false },
        { id: 'ach_1000', name: 'Cookie Enthusiast', desc: 'Bake 1,000 cookies', icon: '🍪🍪', requirement: { type: 'total', value: 1000 }, unlocked: false },
        { id: 'ach_10000', name: 'Cookie Master', desc: 'Bake 10,000 cookies', icon: '🍪🍪🍪', requirement: { type: 'total', value: 10000 }, unlocked: false },
        { id: 'ach_100000', name: 'Cookie Baron', desc: 'Bake 100,000 cookies', icon: '💰', requirement: { type: 'total', value: 100000 }, unlocked: false },
        { id: 'ach_1M', name: 'Cookie Millionaire', desc: 'Bake 1,000,000 cookies', icon: '💎', requirement: { type: 'total', value: 1000000 }, unlocked: false },
        { id: 'ach_10M', name: 'Cookie Billionaire', desc: 'Bake 10,000,000 cookies', icon: '👑', requirement: { type: 'total', value: 10000000 }, unlocked: false },
        { id: 'ach_click10', name: 'Click Master', desc: 'Click the cookie 10 times', icon: '👆', requirement: { type: 'clicks', value: 10 }, unlocked: false },
        { id: 'ach_click100', name: 'Click Maniac', desc: 'Click the cookie 100 times', icon: '🖱️', requirement: { type: 'clicks', value: 100 }, unlocked: false },
        { id: 'ach_click1000', name: 'Click God', desc: 'Click the cookie 1,000 times', icon: '⚡', requirement: { type: 'clicks', value: 1000 }, unlocked: false },
        { id: 'ach_building1', name: 'Builder', desc: 'Own 10 buildings', icon: '🏗️', requirement: { type: 'totalBuildings', value: 10 }, unlocked: false },
        { id: 'ach_building2', name: 'Architect', desc: 'Own 50 buildings', icon: '🏛️', requirement: { type: 'totalBuildings', value: 50 }, unlocked: false },
        { id: 'ach_building3', name: 'Cookie Empire', desc: 'Own 100 buildings', icon: '🏰', requirement: { type: 'totalBuildings', value: 100 }, unlocked: false },
        { id: 'ach_upgrade5', name: 'Upgrader', desc: 'Purchase 5 upgrades', icon: '⬆️', requirement: { type: 'upgrades', value: 5 }, unlocked: false },
        { id: 'ach_upgrade10', name: 'Upgrade Master', desc: 'Purchase 10 upgrades', icon: '🚀', requirement: { type: 'upgrades', value: 10 }, unlocked: false },
        { id: 'ach_golden1', name: 'Lucky!', desc: 'Click a Golden Cookie', icon: '🌟', requirement: { type: 'goldenClicks', value: 1 }, unlocked: false },
        { id: 'ach_golden5', name: 'Golden Touch', desc: 'Click 5 Golden Cookies', icon: '✨', requirement: { type: 'goldenClicks', value: 5 }, unlocked: false },
        { id: 'ach_cps100', name: 'Speed Baker', desc: 'Reach 100 cookies per second', icon: '⚙️', requirement: { type: 'cps', value: 100 }, unlocked: false },
        { id: 'ach_cps1000', name: 'Industrial Baker', desc: 'Reach 1,000 cookies per second', icon: '🏭', requirement: { type: 'cps', value: 1000 }, unlocked: false },
        { id: 'ach_cps10000', name: 'Cookie Factory', desc: 'Reach 10,000 cookies per second', icon: '🌌', requirement: { type: 'cps', value: 10000 }, unlocked: false },
        { id: 'ach_frenzy', name: 'Frenzied!', desc: 'Experience a Frenzy', icon: '⚡', requirement: { type: 'frenzy', value: 1 }, unlocked: false }
    ];

    // Stats tracking
    let totalClicks = 0;
    let totalGoldenClicks = 0;
    let frenzyTriggered = false;

    // ========== DOM Elements ==========
    let cookieCountEl, cpsDisplayEl, clickPowerDisplay, totalBakedDisplay;
    let upgradeCountEl, achievementsStrip, upgradesGrid, buildingsList;
    let toastEl, achToastEl, achToastNameEl, goldenCookieEl;
    let resetBtn, mainCookie;

    // ========== Helper Functions ==========
    function formatNumber(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return Math.floor(num).toString();
    }

    function showToast(message, duration = 2000) {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.classList.remove('hidden');
        setTimeout(() => {
            toastEl.classList.add('hidden');
        }, duration);
    }

    function showAchievementToast(achievement) {
        if (!achToastEl || !achToastNameEl) return;
        achToastNameEl.textContent = achievement.name;
        achToastEl.classList.remove('hidden');
        setTimeout(() => {
            achToastEl.classList.add('hidden');
        }, 3000);
    }

    // Optimized UI update with throttling and pending flag
    function updateUINumbersOnly() {
        // Quick number updates without full re-render
        if (cookieCountEl) cookieCountEl.textContent = formatNumber(Math.floor(cookies));
        if (cpsDisplayEl) cpsDisplayEl.textContent = `${formatNumber(getCurrentCPS())} per second`;
        if (clickPowerDisplay) {
            let power = clickPower * (frenzyMultiplier > 1 ? frenzyMultiplier : 1);
            clickPowerDisplay.textContent = `+${formatNumber(power)} per click`;
        }
        if (totalBakedDisplay) totalBakedDisplay.textContent = formatNumber(totalCookiesBaked);
    }

    function updateUI() {
        if (updateUIPending) return;
        updateUIPending = true;
        
        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
            updateUINumbersOnly();
            
            const purchasedUpgrades = upgrades.filter(u => u.purchased).length;
            if (upgradeCountEl) upgradeCountEl.textContent = purchasedUpgrades;
            
            renderBuildings();
            renderUpgrades();
            renderAchievementsStrip(); // This now checks for changes before re-rendering
            checkAchievements();
            
            updateUIPending = false;
        });
    }

    // Force a full UI update (used after purchases or major changes)
    function forceUIUpdate() {
        if (cookieCountEl) cookieCountEl.textContent = formatNumber(Math.floor(cookies));
        if (cpsDisplayEl) cpsDisplayEl.textContent = `${formatNumber(getCurrentCPS())} per second`;
        if (clickPowerDisplay) {
            let power = clickPower * (frenzyMultiplier > 1 ? frenzyMultiplier : 1);
            clickPowerDisplay.textContent = `+${formatNumber(power)} per click`;
        }
        if (totalBakedDisplay) totalBakedDisplay.textContent = formatNumber(totalCookiesBaked);
        
        const purchasedUpgrades = upgrades.filter(u => u.purchased).length;
        if (upgradeCountEl) upgradeCountEl.textContent = purchasedUpgrades;
        
        renderBuildings();
        renderUpgrades();
        renderAchievementsStrip();
    }

    function getBuildingCost(building) {
        return Math.floor(building.baseCost * Math.pow(1.15, building.count));
    }

    function getBuildingProduction(building) {
        let multiplier = 1;
        const buildingUpgrades = upgrades.filter(u => u.type === 'building' && u.buildingId === building.id && u.purchased);
        for (const upg of buildingUpgrades) multiplier *= upg.value;
        return building.baseCps * building.count * multiplier * globalMultiplier * (frenzyMultiplier > 1 ? frenzyMultiplier : 1);
    }

    function getCurrentCPS() {
        let total = 0;
        for (const building of buildings) total += getBuildingProduction(building);
        return total;
    }

    function buyBuilding(buildingId) {
        const building = buildings.find(b => b.id === buildingId);
        if (!building) return false;
        const cost = getBuildingCost(building);
        if (cookies >= cost) {
            cookies -= cost;
            totalCookiesBaked += cost;
            building.count++;
            forceUIUpdate();
            showToast(`Bought a ${building.name}! +${building.baseCps} cookies/sec`);
            return true;
        } else {
            showToast(`Need ${formatNumber(cost)} cookies for a ${building.name}`);
            return false;
        }
    }

    function purchaseUpgrade(upgradeId) {
        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (!upgrade || upgrade.purchased) return false;
        
        // Check requirements
        if (upgrade.requires) {
            const required = upgrades.find(u => u.id === upgrade.requires);
            if (!required || !required.purchased) return false;
        }
        
        if (upgrade.requiredCookies && totalCookiesBaked < upgrade.requiredCookies) return false;
        
        if (cookies >= upgrade.cost) {
            cookies -= upgrade.cost;
            totalCookiesBaked += upgrade.cost;
            upgrade.purchased = true;
            
            // Apply upgrade effects
            if (upgrade.type === 'click') {
                clickPower += upgrade.value;
            } else if (upgrade.type === 'multiplier') {
                globalMultiplier += upgrade.value;
            }
            
            forceUIUpdate();
            showToast(`Purchased: ${upgrade.name}!`);
            return true;
        } else {
            showToast(`Need ${formatNumber(upgrade.cost)} cookies for ${upgrade.name}`);
            return false;
        }
    }

    function clickCookie(amount = 1) {
        let clickAmount = clickPower * amount;
        if (frenzyMultiplier > 1) clickAmount *= frenzyMultiplier;
        
        cookies += clickAmount;
        totalCookiesBaked += clickAmount;
        totalClicks++;
        
        updateUINumbersOnly();
        createClickParticle(clickAmount);
        checkAchievements();
    }

    function createClickParticle(amount) {
        const particlesContainer = document.getElementById('click-particles');
        if (!particlesContainer) return;
        
        const particle = document.createElement('div');
        particle.className = 'click-particle';
        particle.textContent = `+${formatNumber(amount)}`;
        particle.style.left = Math.random() * 80 + 10 + '%';
        particle.style.top = Math.random() * 60 + 20 + '%';
        particlesContainer.appendChild(particle);
        
        setTimeout(() => particle.remove(), 900);
    }

    // Golden Cookie System
    function spawnGoldenCookie() {
        if (goldenCookieVisible) return;
        
        const gc = goldenCookieEl;
        if (!gc) return;
        
        const maxX = window.innerWidth - 80;
        const maxY = window.innerHeight - 80;
        const x = Math.random() * maxX;
        const y = Math.random() * maxY;
        
        gc.style.left = x + 'px';
        gc.style.top = y + 'px';
        gc.classList.remove('hidden');
        goldenCookieVisible = true;
        
        // Golden Cookie disappears after 13 seconds
        setTimeout(() => {
            if (goldenCookieVisible) {
                gc.classList.add('hidden');
                goldenCookieVisible = false;
            }
        }, 13000);
    }

    function clickGoldenCookie() {
        if (!goldenCookieVisible) return;
        
        goldenCookieVisible = false;
        goldenCookieEl.classList.add('hidden');
        totalGoldenClicks++;
        
        // Random effect
        const effects = ['frenzy', 'lucky', 'storm'];
        const effect = effects[Math.floor(Math.random() * effects.length)];
        
        if (effect === 'frenzy') {
            frenzyMultiplier = 7;
            frenzyEndTime = Date.now() + 77000;
            if (!frenzyTriggered) frenzyTriggered = true;
            document.body.classList.add('frenzy');
            showToast('FRENZY! 7x production for 77 seconds! 🎉', 3000);
            setTimeout(() => {
                if (Date.now() >= frenzyEndTime) {
                    frenzyMultiplier = 1;
                    document.body.classList.remove('frenzy');
                    showToast('Frenzy ended', 2000);
                }
            }, 77000);
        } else if (effect === 'lucky') {
            const bonus = Math.min(cookies * 0.15, 1000000);
            cookies += bonus;
            totalCookiesBaked += bonus;
            showToast(`Lucky! +${formatNumber(bonus)} cookies! 🍀`, 2000);
            updateUINumbersOnly();
        } else if (effect === 'storm') {
            const stormCookies = Math.floor(getCurrentCPS() * 30);
            cookies += stormCookies;
            totalCookiesBaked += stormCookies;
            showToast(`Cookie Storm! +${formatNumber(stormCookies)} cookies! 🌪️`, 2000);
            updateUINumbersOnly();
        }
        
        checkAchievements();
    }

    // Golden Cookie spawn timer
    function startGoldenCookieTimer() {
        setInterval(() => {
            if (!goldenCookieVisible && Math.random() < 0.3) {
                spawnGoldenCookie();
            }
        }, 15000);
    }

    // Optimized production loop with throttled UI updates
    function startProductionLoop() {
        let lastUpdate = Date.now();
        let lastUIUpdate = 0;
        
        setInterval(() => {
            const now = Date.now();
            const delta = Math.min(1, (now - lastUpdate) / 1000);
            lastUpdate = now;
            
            // Update frenzy status
            if (frenzyMultiplier > 1 && Date.now() >= frenzyEndTime) {
                frenzyMultiplier = 1;
                document.body.classList.remove('frenzy');
            }
            
            const cps = getCurrentCPS();
            const gained = cps * delta;
            cookies += gained;
            totalCookiesBaked += gained;
            
            // Throttle UI updates - only update every UI_UPDATE_INTERVAL ms
            if (now - lastUIUpdate >= UI_UPDATE_INTERVAL) {
                lastUIUpdate = now;
                updateUI();
            } else {
                // Still update numbers without full re-render for smooth counter
                if (cookieCountEl) cookieCountEl.textContent = formatNumber(Math.floor(cookies));
                if (cpsDisplayEl) cpsDisplayEl.textContent = `${formatNumber(getCurrentCPS())} per second`;
            }
        }, 50); // Update logic every 50ms for smooth production
    }

    // Offline production
    function calculateOfflineProduction() {
        const lastSave = localStorage.getItem('lastSaveTime');
        if (lastSave) {
            const now = Date.now();
            const elapsed = Math.min(8 * 60 * 60 * 1000, now - parseInt(lastSave));
            if (elapsed > 5000) {
                const offlineCPS = getCurrentCPS();
                const offlineCookies = offlineCPS * (elapsed / 1000);
                cookies += offlineCookies;
                totalCookiesBaked += offlineCookies;
                offlineProduction = offlineCookies;
                showToast(`You earned ${formatNumber(offlineCookies)} cookies while away! 🍪`, 4000);
                forceUIUpdate();
            }
        }
        localStorage.setItem('lastSaveTime', Date.now().toString());
    }

    // Achievement checking
    let lastAchievementCheck = 0;
    function checkAchievements() {
        const now = Date.now();
        // Throttle achievement checking to once per second
        if (now - lastAchievementCheck < 1000) return;
        lastAchievementCheck = now;
        
        let anyUnlocked = false;
        
        for (const ach of achievements) {
            if (ach.unlocked) continue;
            
            let achieved = false;
            switch (ach.requirement.type) {
                case 'total':
                    achieved = totalCookiesBaked >= ach.requirement.value;
                    break;
                case 'clicks':
                    achieved = totalClicks >= ach.requirement.value;
                    break;
                case 'totalBuildings':
                    const totalBuildings = buildings.reduce((sum, b) => sum + b.count, 0);
                    achieved = totalBuildings >= ach.requirement.value;
                    break;
                case 'upgrades':
                    const purchasedUpgrades = upgrades.filter(u => u.purchased).length;
                    achieved = purchasedUpgrades >= ach.requirement.value;
                    break;
                case 'goldenClicks':
                    achieved = totalGoldenClicks >= ach.requirement.value;
                    break;
                case 'cps':
                    achieved = getCurrentCPS() >= ach.requirement.value;
                    break;
                case 'frenzy':
                    achieved = frenzyTriggered;
                    break;
            }
            
            if (achieved) {
                ach.unlocked = true;
                anyUnlocked = true;
                showAchievementToast(ach);
                showToast(`Achievement Unlocked: ${ach.name}! 🏆`, 3000);
            }
        }
        
        if (anyUnlocked) {
            renderAchievementsStrip();
            renderAchievementsPreview();
            forceUIUpdate();
        }
    }

    // Render functions
    function renderBuildings() {
        if (!buildingsList) return;
        buildingsList.innerHTML = '';
        
        for (const building of buildings) {
            const cost = getBuildingCost(building);
            const canAfford = cookies >= cost;
            const btn = document.createElement('button');
            btn.className = `building-btn ${building.count > 0 ? 'owned' : ''} ${canAfford ? 'can-afford' : ''}`;
            btn.innerHTML = `
                <span class="b-icon">${building.icon}</span>
                <div class="b-info">
                    <span class="b-name">${building.name}</span>
                    <span class="b-cps">${formatNumber(building.baseCps)}/sec each</span>
                </div>
                <div class="b-right">
                    <span class="b-cost">🍪 ${formatNumber(cost)}</span>
                    <span class="b-count">${building.count}</span>
                </div>
            `;
            if (canAfford) {
                btn.onclick = () => buyBuilding(building.id);
            }
            buildingsList.appendChild(btn);
        }
    }
    
    function renderUpgrades() {
        if (!upgradesGrid) return;
        upgradesGrid.innerHTML = '';
        
        const purchasedUpgrades = upgrades.filter(u => u.purchased).length;
        
        for (const upgrade of upgrades) {
            if (upgrade.purchased) {
                const div = document.createElement('div');
                div.className = 'upgrade-btn purchased';
                div.innerHTML = `
                    <span class="upg-icon">${upgrade.icon}</span>
                    <span>${upgrade.name}</span>
                    <span class="upg-cost">✓</span>
                `;
                upgradesGrid.appendChild(div);
                continue;
            }
            
            let isLocked = false;
            if (upgrade.requires) {
                const required = upgrades.find(u => u.id === upgrade.requires);
                if (!required || !required.purchased) isLocked = true;
            }
            if (upgrade.requiredCookies && totalCookiesBaked < upgrade.requiredCookies) isLocked = true;
            
            const canAfford = cookies >= upgrade.cost && !isLocked;
            const btn = document.createElement('button');
            btn.className = `upgrade-btn ${canAfford ? 'can-afford' : ''} ${isLocked ? 'locked' : ''}`;
            btn.innerHTML = `
                <span class="upg-icon">${upgrade.icon}</span>
                <span>${upgrade.name}</span>
                <span class="upg-cost">🍪 ${formatNumber(upgrade.cost)}</span>
            `;
            if (canAfford) {
                btn.onclick = () => purchaseUpgrade(upgrade.id);
            }
            upgradesGrid.appendChild(btn);
        }
        
        if (upgrades.length === purchasedUpgrades) {
            const div = document.createElement('div');
            div.className = 'upg-empty';
            div.textContent = '✨ All upgrades purchased! ✨';
            upgradesGrid.appendChild(div);
        }
    }
    
    // Optimized renderAchievementsStrip with caching to prevent blinking
    function renderAchievementsStrip() {
        if (!achievementsStrip) return;
        
        const unlocked = achievements.filter(a => a.unlocked);
        
        // Create a hash of current unlocked achievements to detect changes
        const currentHash = unlocked.map(a => a.id).join(',');
        
        // Only re-render if achievements actually changed
        if (currentHash === lastAchievementsHash && achievementsStrip.innerHTML !== '') {
            return;
        }
        lastAchievementsHash = currentHash;
        
        if (unlocked.length === 0) {
            achievementsStrip.innerHTML = '<div class="ach-empty">Keep baking to earn achievements!</div>';
            return;
        }
        
        // Use document fragment for better performance
        const fragment = document.createDocumentFragment();
        for (const ach of unlocked.slice(-8)) {
            const badge = document.createElement('div');
            badge.className = 'ach-badge';
            badge.textContent = ach.icon;
            badge.title = `${ach.name}: ${ach.desc}`;
            fragment.appendChild(badge);
        }
        
        achievementsStrip.innerHTML = '';
        achievementsStrip.appendChild(fragment);
    }
    
    function renderAchievementsPreview() {
        const grid = document.getElementById('ach-preview-grid');
        if (!grid) return;
        grid.innerHTML = '';
        
        for (const ach of achievements) {
            const card = document.createElement('div');
            card.className = 'ach-preview-card';
            card.style.opacity = ach.unlocked ? '1' : '0.5';
            card.style.filter = ach.unlocked ? 'none' : 'grayscale(0.5)';
            card.innerHTML = `
                <div class="apc-icon">${ach.icon}</div>
                <div class="apc-info">
                    <strong>${ach.name}</strong>
                    <span>${ach.desc}</span>
                </div>
            `;
            grid.appendChild(card);
        }
    }
    
    // FAQ Toggle
    window.toggleFaq = function(btn) {
        const faqA = btn.nextElementSibling;
        btn.classList.toggle('open');
        faqA.classList.toggle('open');
    };
    
    // Save/Load Game
    function saveGame() {
        const saveData = {
            cookies, totalCookiesBaked, clickPower, globalMultiplier,
            totalClicks, totalGoldenClicks, frenzyTriggered,
            buildings: buildings.map(b => ({ id: b.id, count: b.count })),
            upgrades: upgrades.map(u => ({ id: u.id, purchased: u.purchased })),
            achievements: achievements.map(a => ({ id: a.id, unlocked: a.unlocked })),
            lastSaveTime: Date.now()
        };
        localStorage.setItem('cookieClickerSave', JSON.stringify(saveData));
        localStorage.setItem('lastSaveTime', Date.now().toString());
    }
    
    function loadGame() {
        const saved = localStorage.getItem('cookieClickerSave');
        if (!saved) {
            calculateOfflineProduction();
            return;
        }
        
        try {
            const data = JSON.parse(saved);
            cookies = data.cookies || 0;
            totalCookiesBaked = data.totalCookiesBaked || 0;
            clickPower = data.clickPower || 1;
            globalMultiplier = data.globalMultiplier || 1;
            totalClicks = data.totalClicks || 0;
            totalGoldenClicks = data.totalGoldenClicks || 0;
            frenzyTriggered = data.frenzyTriggered || false;
            
            if (data.buildings) {
                for (const b of data.buildings) {
                    const building = buildings.find(bld => bld.id === b.id);
                    if (building) building.count = b.count;
                }
            }
            
            if (data.upgrades) {
                for (const u of data.upgrades) {
                    const upgrade = upgrades.find(upg => upg.id === u.id);
                    if (upgrade) upgrade.purchased = u.purchased;
                    if (upgrade && upgrade.purchased) {
                        if (upgrade.type === 'click') clickPower += upgrade.value;
                        if (upgrade.type === 'multiplier') globalMultiplier += upgrade.value;
                    }
                }
            }
            
            if (data.achievements) {
                for (const a of data.achievements) {
                    const ach = achievements.find(achv => achv.id === a.id);
                    if (ach) ach.unlocked = a.unlocked;
                }
            }
            
            // Update achievements hash after loading
            const unlocked = achievements.filter(a => a.unlocked);
            lastAchievementsHash = unlocked.map(a => a.id).join(',');
            
            calculateOfflineProduction();
            forceUIUpdate();
            renderAchievementsPreview();
            showToast('Game loaded! Welcome back! 🍪', 2000);
        } catch (e) {
            console.error('Failed to load save:', e);
            calculateOfflineProduction();
        }
    }
    
    function resetGame() {
        if (confirm('Reset all your progress? This cannot be undone!')) {
            cookies = 0;
            totalCookiesBaked = 0;
            clickPower = 1;
            globalMultiplier = 1;
            totalClicks = 0;
            totalGoldenClicks = 0;
            frenzyTriggered = false;
            frenzyMultiplier = 1;
            frenzyEndTime = 0;
            
            for (const building of buildings) building.count = 0;
            for (const upgrade of upgrades) upgrade.purchased = false;
            for (const ach of achievements) ach.unlocked = false;
            
            // Reset achievements hash
            lastAchievementsHash = '';
            
            forceUIUpdate();
            renderAchievementsPreview();
            saveGame();
            showToast('Game reset! Start fresh! 🍪', 2000);
        }
    }
    
    // Initialize event listeners
    function initEventListeners() {
        if (mainCookie) {
            mainCookie.addEventListener('click', (e) => {
                e.preventDefault();
                clickCookie(1);
            });
        }
        
        if (resetBtn) resetBtn.addEventListener('click', resetGame);
        
        if (goldenCookieEl) {
            goldenCookieEl.addEventListener('click', clickGoldenCookie);
        }
        
        // Save on page unload
        window.addEventListener('beforeunload', saveGame);
        
        // Auto-save every 30 seconds
        if (saveInterval) clearInterval(saveInterval);
        saveInterval = setInterval(saveGame, 30000);
    }
    
    // Initialize DOM elements
    function initDOM() {
        cookieCountEl = document.getElementById('cookie-count');
        cpsDisplayEl = document.getElementById('cps-display');
        clickPowerDisplay = document.getElementById('click-power-display');
        totalBakedDisplay = document.getElementById('total-baked-display');
        upgradeCountEl = document.getElementById('upgrade-count');
        achievementsStrip = document.getElementById('achievements-strip');
        upgradesGrid = document.getElementById('upgrades-grid');
        buildingsList = document.getElementById('buildings-list');
        toastEl = document.getElementById('toast');
        achToastEl = document.getElementById('ach-toast');
        achToastNameEl = document.getElementById('ach-toast-name');
        goldenCookieEl = document.getElementById('golden-cookie');
        resetBtn = document.getElementById('reset-btn');
        mainCookie = document.getElementById('main-cookie');
    }
    
    // Main initialization
    function init() {
        initDOM();
        loadGame();
        initEventListeners();
        startProductionLoop();
        startGoldenCookieTimer();
        renderAchievementsPreview();
        forceUIUpdate();
        
        // Scrolled header effect
        const header = document.querySelector('.site-header');
        if (header) {
            window.addEventListener('scroll', () => {
                header.classList.toggle('scrolled', window.scrollY > 40);
            });
        }
        
        console.log('Cookie Clicker initialized! 🍪');
    }
    
    // Start the game when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
