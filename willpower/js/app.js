const System = {
    user: {
        name: 'Hal Jordan',
        level: 1,
        exp: 0,
        willPower: 10,
        rank: 'Rookie Lantern',
        streak: 0,
        lastLogin: null,
        lastFocusDate: null
    },
    config: {
        expPerLevel: (lvl) => Math.floor(100 * Math.pow(1.2, lvl - 1)),
        ranks: {
            1: 'Rookie Lantern',
            5: 'Guardian Apprentice',
            10: 'Sector Protector',
            20: 'Willpower Master',
            50: 'Legendary Green Lantern'
        },
        oaths: [
            `In brightest day in blackest night
No evil shall escape my sight
Let those who worship evil's might
Beware my power Green Lantern's light`,
            `In brightest day, in darkest night,
I'll embrace my fear, I'll do what's right.
I choose this ring, I choose this fight,
In service to this lantern's light.`
        ],
        dailyExp: 50 // Опыт за ежедневный фокус
    },
    
    save() {
        localStorage.setItem('willpower_save', JSON.stringify(this.user));
    },
    
    load() {
        const saved = localStorage.getItem('willpower_save');
        if (saved) {
            this.user = JSON.parse(saved);
        }
        this.updateStreak();
    },
    
    updateStreak() {
        const today = new Date().toDateString();
        if (!this.user.lastLogin) {
            this.user.streak = 1;
            this.user.lastLogin = today;
        } else {
            const lastDate = new Date(this.user.lastLogin);
            const todayDate = new Date();
            const diffTime = Math.abs(todayDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                this.user.streak++;
                this.user.lastLogin = today;
            } else if (diffDays > 1) {
                this.user.streak = 1;
                this.user.lastLogin = today;
            }
        }
        this.save();
    },
    
    dailyFocus() {
        const today = new Date().toDateString();
        if (this.user.lastFocusDate === today) {
            alert('Your ring is already charged for today, Lantern. Come back tomorrow!');
            return false;
        }

        this.user.lastFocusDate = today;
        this.addExp(this.config.dailyExp);
        
        // Если пользователь зашел и нажал кнопку, засчитываем это как активность дня
        if (this.user.lastLogin !== today) {
            this.user.streak++;
            this.user.lastLogin = today;
        }
        
        this.save();
        updateUI();
        alert('Energy focused! Your will is strong.');
        return true;
    },
    
    addExp(amount) {
        this.user.exp += amount;
        this.checkLevelUp();
        this.save();
        updateUI();
    },
    
    checkLevelUp() {
        while (this.user.exp >= this.config.expPerLevel(this.user.level)) {
            this.user.exp -= this.config.expPerLevel(this.user.level);
            this.user.level++;
            this.user.willPower += 5;
            
            const rankLevels = Object.keys(this.config.ranks).map(Number).sort((a, b) => b - a);
            const currentRankLevel = rankLevels.find(lvl => this.user.level >= lvl);
            this.user.rank = this.config.ranks[currentRankLevel];
        }
    },

    reset() {
        this.user = {
            name: 'Hal Jordan',
            level: 1,
            exp: 0,
            willPower: 10,
            rank: 'Rookie Lantern',
            streak: 0,
            lastLogin: null,
            lastFocusDate: null
        };
        this.save();
        updateUI();
    }
};

function updateUI() {
    document.getElementById('rank').innerText = System.user.rank;
    document.getElementById('level').innerText = System.user.level;
    document.getElementById('willpower-val').innerText = System.user.willPower;
    document.getElementById('username-input').value = System.user.name;
    document.getElementById('streak-val').innerText = System.user.streak;
    
    const currentExp = System.user.exp;
    const nextExp = System.config.expPerLevel(System.user.level);
    const percent = (currentExp / nextExp) * 100;
    
    document.getElementById('current-exp').innerText = currentExp;
    document.getElementById('next-exp').innerText = nextExp;
    document.getElementById('exp-bar').style.width = percent + '%';
}

document.getElementById('username-input').addEventListener('input', (e) => {
    System.user.name = e.target.value;
    System.save();
});

document.getElementById('train-btn').addEventListener('click', () => {
    System.dailyFocus();
});

// --- Reset Logic ---
const modal = document.getElementById('reset-modal');
const oathBox = document.getElementById('oath-box');
const oathInput = document.getElementById('oath-input');

document.getElementById('reset-btn').addEventListener('click', () => {
    const randomOath = System.config.oaths[Math.floor(Math.random() * System.config.oaths.length)];
    oathBox.innerText = randomOath;
    modal.dataset.requiredOath = randomOath;
    modal.style.display = 'flex';
});

document.getElementById('close-modal').addEventListener('click', () => {
    modal.style.display = 'none';
    oathInput.value = '';
});

document.getElementById('confirm-reset').addEventListener('click', () => {
    const requiredOath = modal.dataset.requiredOath;
    const userText = oathInput.value.trim().toLowerCase();
    const cleanRequired = requiredOath.toLowerCase().replace(/\s+/g, ' ');
    const cleanUser = userText.replace(/\s+/g, ' ');

    if (cleanUser === cleanRequired) {
        System.reset();
        modal.style.display = 'none';
        oathInput.value = '';
        alert('The Ring is purified. Your journey begins anew.');
    } else {
        alert('The Ring does not recognize your will. The oath is incorrect.');
    }
});

System.load();
updateUI();