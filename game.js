class Game {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.currentImageId = null;
        this.streak = 0;
        this.levelThreshold = 5;
        this.canAnswer = true;
        
        // DOM元素
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.imageElement = document.getElementById('game-image');
        this.resultElement = document.getElementById('result');
        this.continueBtn = document.getElementById('continueBtn');
        this.realBtn = document.getElementById('realBtn');
        this.fakeBtn = document.getElementById('fakeBtn');
        this.resultPanel = document.getElementById('resultPanel');
        this.resultEmoji = document.getElementById('resultEmoji');
        this.resultMessage = document.getElementById('resultMessage');
        
        // 添加统计相关属性
        this.totalImages = 0;
        this.correctImages = 0;
        this.wrongImages = 0;
        this.progressElement = document.getElementById('progress');
        
        // 绑定按钮事件
        this.realBtn.addEventListener('click', () => this.checkAnswer(1));
        this.fakeBtn.addEventListener('click', () => this.checkAnswer(0));
        this.continueBtn.addEventListener('click', () => this.showNextImage());
        
        // 初始化统计
        this.updateStats();
        
        // 初始化时隐藏结果面板
        this.resultPanel.style.display = 'none';
        
        this.showNextImage();
        
        // 添加主题切换功能
        this.initThemeSwitcher();
    }
    
    initThemeSwitcher() {
        const themeBtns = document.querySelectorAll('.theme-btn');
        
        themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 移除其他按钮的激活状态
                themeBtns.forEach(b => b.classList.remove('active'));
                // 激活当前按钮
                btn.classList.add('active');
                // 设置主题
                document.documentElement.setAttribute('data-theme', btn.dataset.theme);
                // 保存主题选择到本地存储
                localStorage.setItem('gameTheme', btn.dataset.theme);
            });
        });
        
        // 加载保存的主题
        const savedTheme = localStorage.getItem('gameTheme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            themeBtns.forEach(btn => {
                if (btn.dataset.theme === savedTheme) {
                    btn.classList.add('active');
                }
            });
        }
    }
    
    showNextImage() {
        this.currentImageId = Math.floor(Math.random() * db.length);
        
        // 添加图片加载处理
        this.imageElement.classList.add('loading');
        this.imageElement.onload = () => {
            this.imageElement.classList.remove('loading');
            this.imageElement.classList.add('loaded');
        };
        
        this.imageElement.src = `db/pic/${this.currentImageId}.jpg`;
        this.canAnswer = true;
        
        // 隐藏结果面板
        this.resultPanel.style.display = 'none';
        this.resultPanel.classList.remove('show');
        this.continueBtn.classList.remove('show');
        this.realBtn.disabled = false;
        this.fakeBtn.disabled = false;
    }
    
    updateStats() {
        // 计算总图片数
        this.totalImages = this.correctImages + this.wrongImages;
        
        // 计算正确率
        const accuracy = this.totalImages > 0 
            ? Math.round((this.correctImages / this.totalImages) * 100) 
            : 0;
            
        // 计算当前等级进度
        const nextLevelScore = this.level * this.levelThreshold;
        const currentProgress = this.score % this.levelThreshold;
        const progressPercent = Math.round((currentProgress / this.levelThreshold) * 100);
        
        // 更新进度显示
        this.progressElement.innerHTML = `
            <div class="stats-row">
                <span>已答题：${this.totalImages}张</span>
                <span>正确率：${accuracy}%</span>
            </div>
            <div class="level-progress">
                <div class="progress-bar" style="width: ${progressPercent}%"></div>
                <span class="progress-text">${currentProgress}/${this.levelThreshold}</span>
            </div>
        `;
    }
    
    checkAnswer(userAnswer) {
        if (!this.canAnswer) return;
        
        const correctAnswer = db[this.currentImageId].ans;
        this.canAnswer = false;
        
        // 禁用答题按钮
        this.realBtn.disabled = true;
        this.fakeBtn.disabled = true;
        
        let emoji, message, answerText;
        
        // 设置答案文本
        answerText = correctAnswer === 1 ? '真实' : '虚假';
        
        if (userAnswer === correctAnswer) {
            this.correctImages++;
            this.score++;
            this.streak++;
            emoji = '😊';
            message = `太棒了！你说对了！<br><span class="answer-text">正确答案: ${answerText}</span>`;
            
            if (this.score >= this.level * this.levelThreshold) {
                this.level++;
                this.levelElement.textContent = this.level;
                this.levelElement.classList.add('level-up');
                setTimeout(() => {
                    this.levelElement.classList.remove('level-up');
                }, 500);
                emoji = '🎉';
                message = `升级啦！现在是 ${this.level} 级！<br><span class="answer-text">正确答案: ${answerText}</span>`;
            }
        } else {
            this.wrongImages++;
            this.streak = 0;
            emoji = '😅';
            message = `哎呀，答错了...<br><span class="answer-text">正确答案: ${answerText}</span>`;
        }
        
        this.scoreElement.textContent = this.score;
        
        // 显示结果面板
        this.resultPanel.style.display = 'block';
        this.resultEmoji.textContent = emoji;
        this.resultMessage.innerHTML = message;
        
        // 使用setTimeout确保display:block后再添加show类
        setTimeout(() => {
            this.resultPanel.classList.add('show');
        }, 10);
        
        // 延迟显示继续按钮
        setTimeout(() => {
            this.continueBtn.classList.add('show');
        }, 1000);
        
        this.updateStats();
    }
}

// 启动游戏
window.onload = () => {
    new Game();
}; 
