let allData = {
    tools: [],
    repositories: [],
    articles: [],
    extensions: [],
    dorks: [],
    checklists: []
};

let currentFilters = {
    tools: 'all',
    articles: 'all'
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initializeEventListeners();
    renderAllSections();
    animateStats();
});

async function loadData() {
    try {
        const response = await fetch('data.json');
        allData = await response.json();
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        showNotification('حدث خطأ في تحميل البيانات', 'error');
    }
}

function initializeEventListeners() {
    const searchToggle = document.getElementById('searchToggle');
    const searchBar = document.getElementById('searchBar');
    const searchClose = document.getElementById('searchClose');
    const globalSearch = document.getElementById('globalSearch');
    const themeToggle = document.getElementById('themeToggle');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebarClose');
    const overlay = document.getElementById('overlay');
    const scrollTop = document.getElementById('scrollTop');

    searchToggle.addEventListener('click', () => {
        searchBar.classList.toggle('active');
        if (searchBar.classList.contains('active')) {
            globalSearch.focus();
        }
    });

    searchClose.addEventListener('click', () => {
        searchBar.classList.remove('active');
        globalSearch.value = '';
        renderAllSections();
    });

    globalSearch.addEventListener('input', (e) => {
        handleGlobalSearch(e.target.value);
    });

    themeToggle.addEventListener('click', () => {
        toggleTheme();
    });

    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    });

    sidebarClose.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    });

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTop.classList.add('visible');
        } else {
            scrollTop.classList.remove('visible');
        }
    });

    scrollTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.closest('.section').id;
            const category = e.target.dataset.category;
            
            e.target.parentElement.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
            });
            e.target.classList.add('active');
            
            if (section === 'tools') {
                currentFilters.tools = category;
                renderTools();
            } else if (section === 'articles') {
                currentFilters.articles = category;
                renderArticles();
            }
        });
    });

    const domainInput = document.getElementById('domainInput');
    if (domainInput) {
        domainInput.addEventListener('input', () => {
            renderDorks();
        });
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const themeIcon = document.querySelector('#themeToggle i');
    
    if (html.getAttribute('data-theme') === 'dark') {
        html.removeAttribute('data-theme');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        html.setAttribute('data-theme', 'dark');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    }
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
}

function handleGlobalSearch(query) {
    if (!query.trim()) {
        renderAllSections();
        return;
    }

    const lowerQuery = query.toLowerCase();
    
    const filteredTools = allData.tools.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) || 
        item.description.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery)
    );
    
    const filteredRepos = allData.repositories.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) || 
        item.description.toLowerCase().includes(lowerQuery)
    );
    
    const filteredArticles = allData.articles.filter(item => 
        item.title.toLowerCase().includes(lowerQuery) || 
        item.description.toLowerCase().includes(lowerQuery)
    );
    
    const filteredExtensions = allData.extensions.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) || 
        item.description.toLowerCase().includes(lowerQuery)
    );
    
    const filteredChecklists = allData.checklists.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) || 
        item.description.toLowerCase().includes(lowerQuery)
    );
    
    renderSection('toolsGrid', filteredTools, createToolCard);
    renderSection('repositoriesGrid', filteredRepos, createRepositoryCard);
    renderSection('articlesGrid', filteredArticles, createArticleCard);
    renderSection('extensionsGrid', filteredExtensions, createExtensionCard);
    renderSection('checklistsGrid', filteredChecklists, createChecklistCard);
}

function renderAllSections() {
    renderTools();
    renderRepositories();
    renderArticles();
    renderExtensions();
    renderDorks();
    renderChecklists();
}

function renderTools() {
    const filtered = currentFilters.tools === 'all' 
        ? allData.tools 
        : allData.tools.filter(t => t.category === currentFilters.tools);
    renderSection('toolsGrid', filtered, createToolCard);
}

function renderRepositories() {
    renderSection('repositoriesGrid', allData.repositories, createRepositoryCard);
}

function renderArticles() {
    const filtered = currentFilters.articles === 'all' 
        ? allData.articles 
        : allData.articles.filter(a => a.category === currentFilters.articles);
    renderSection('articlesGrid', filtered, createArticleCard);
}

function renderExtensions() {
    renderSection('extensionsGrid', allData.extensions, createExtensionCard);
}

function renderDorks() {
    const domain = document.getElementById('domainInput').value.trim();
    renderSection('dorksGrid', allData.dorks, (dork) => createDorkCard(dork, domain));
}

function renderChecklists() {
    renderSection('checklistsGrid', allData.checklists, createChecklistCard);
}

function renderSection(gridId, data, cardCreator) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    if (data.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-search"></i>
                <p>لا توجد نتائج</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = data.map(cardCreator).join('');
}

function createToolCard(tool) {
    return `
        <div class="card" data-category="${tool.category}">
            <div class="card-icon">
                <i class="fas ${tool.icon}"></i>
            </div>
            <span class="card-category">${tool.category}</span>
            <h3>${tool.name}</h3>
            <p>${tool.description}</p>
            <a href="${tool.link}" target="_blank" rel="noopener noreferrer" class="card-link">
                <i class="fab fa-github"></i>
                عرض على GitHub
                <i class="fas fa-arrow-left"></i>
            </a>
        </div>
    `;
}

function createRepositoryCard(repo) {
    return `
        <div class="card">
            <div class="card-icon">
                <i class="fas fa-code-branch"></i>
            </div>
            <span class="card-category">${repo.category}</span>
            <h3>${repo.name}</h3>
            <p>${repo.description}</p>
            <a href="${repo.link}" target="_blank" rel="noopener noreferrer" class="card-link">
                <i class="fab fa-github"></i>
                فتح المستودع
                <i class="fas fa-arrow-left"></i>
            </a>
        </div>
    `;
}

function createArticleCard(article) {
    return `
        <div class="article-card">
            <div class="article-header">
                <span class="article-category">${article.category}</span>
                <h3>${article.title}</h3>
            </div>
            <div class="article-body">
                <p class="article-description">${article.description}</p>
                <div class="article-meta">
                    <span><i class="far fa-calendar-alt"></i> ${article.date}</span>
                    <span><i class="far fa-clock"></i> ${article.readTime}</span>
                </div>
                <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="article-link">
                    <i class="fab fa-medium"></i>
                    اقرأ المقال
                    <i class="fas fa-arrow-left"></i>
                </a>
            </div>
        </div>
    `;
}

function createExtensionCard(ext) {
    const iconClass = ext.icon === 'fa-github' ? 'fab fa-github' : 'fab fa-firefox';
    return `
        <div class="card">
            <div class="card-icon">
                <i class="fas fa-puzzle-piece"></i>
            </div>
            <h3>${ext.name}</h3>
            <p>${ext.description}</p>
            <a href="${ext.link}" target="_blank" rel="noopener noreferrer" class="card-link">
                <i class="${iconClass}"></i>
                احصل على ${ext.store}
                <i class="fas fa-arrow-left"></i>
            </a>
        </div>
    `;
}

function createDorkCard(dork, domain) {
    const query = domain ? dork.query.replace('{domain}', domain) : dork.query;
    const googleSearchUrl = domain ? `https://www.google.com/search?q=${encodeURIComponent(query)}` : '#';
    
    return `
        <div class="dork-card" onclick="${domain ? `window.open('${googleSearchUrl}', '_blank')` : ''}">
            <div class="card-icon">
                <i class="fas ${dork.icon}"></i>
            </div>
            <h3>${dork.name}</h3>
            <p>${dork.description}</p>
            <div class="dork-query">${query}</div>
            ${domain ? '<p style="margin-top: 1rem; color: var(--primary-color); font-weight: 600;">انقر للبحث في Google</p>' : '<p style="margin-top: 1rem; color: var(--text-secondary);">أدخل النطاق أعلاه للبحث</p>'}
        </div>
    `;
}

function createChecklistCard(checklist) {
    return `
        <div class="card">
            <div class="card-icon">
                <i class="fas fa-clipboard-check"></i>
            </div>
            <span class="card-category">${checklist.category}</span>
            <h3>${checklist.name}</h3>
            <p>${checklist.description}</p>
            <a href="${checklist.link}" target="_blank" rel="noopener noreferrer" class="card-link">
                <i class="fas fa-external-link-alt"></i>
                فتح المصدر
                <i class="fas fa-arrow-left"></i>
            </a>
        </div>
    `;
}

function animateStats() {
    const stats = [
        { id: 'toolsCount', target: allData.tools.length },
        { id: 'reposCount', target: allData.repositories.length },
        { id: 'articlesCount', target: allData.articles.length },
        { id: 'extensionsCount', target: allData.extensions.length }
    ];
    
    stats.forEach(stat => {
        animateValue(stat.id, 0, stat.target, 2000);
    });
}

function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    if (!element) return;
    
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current + '+';
        if (current === end) {
            clearInterval(timer);
        }
    }, stepTime);
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    
    if (type === 'error') {
        notification.style.background = 'var(--accent-color)';
    } else {
        notification.style.background = 'var(--success-color)';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});
