document.addEventListener('DOMContentLoaded', async () => {
    const app = document.getElementById('team-member-app');
    if (!app) return;

    const getUrlParam = (name) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    };

    const escapeHtml = (value) => {
        if (value === null || value === undefined) return '';
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    };

    const getNavTitleKo = (member) => {
        const role = String(member?.roleKo || '').trim();
        const highlights = Array.isArray(member?.highlights) ? member.highlights : [];

        if (role.includes('회장')) return '회장';
        if (role.includes('대표이사')) return '대표이사';
        if (role.includes('부사장')) return '부사장';
        if (role.includes('팀장')) return '팀장';
        if (role.includes('교수')) return '교수';
        if (role.includes('과장')) return '과장';
        if (role.includes('센터장')) return '센터장';
        if (role.includes('CEO')) return 'CEO';
        if (role.includes('이사')) return '이사';

        if (highlights.some(item => String(item).includes('팀장'))) return '팀장';
        if (role.includes('/')) {
            const first = role.split('/')[0].trim();
            if (first) return first;
        }

        return role;
    };

    const formatNavLabel = (member) => {
        const title = getNavTitleKo(member);
        return `${member.nameKo}${title ? ` ${title}` : ''}`;
    };

    const renderMemberList = (members) => {
        const renderGroup = (label, group) => {
            const groupMembers = members.filter(m => m.group === group);
            if (groupMembers.length === 0) return '';

            const listHtml = groupMembers.map(m => {
                const metaText = m.nameEn || m.roleKo || '';
                return `
                    <li class="member-list-item">
                        <a class="member-list-link" href="team-member.html?id=${encodeURIComponent(m.id)}">
                            ${escapeHtml(m.nameKo)}${metaText ? `<span class="member-list-en">${escapeHtml(metaText)}</span>` : ''}
                        </a>
                    </li>
                `;
            }).join('');

            return `
                <h2 class="h2-title">${escapeHtml(label)}</h2>
                <div class="about-card">
                    <ul class="member-list">
                        ${listHtml}
                    </ul>
                </div>
            `;
        };

        app.innerHTML = `
            ${renderGroup('Core Team', 'core')}
            ${renderGroup('Advisory Board', 'advisory')}
        `;
    };

    const renderMemberDetail = (member) => {
        const groupLabel = member.group === 'core' ? 'Core Team' : 'Advisory Board';
        const nameEnHtml = member.nameEn
            ? `<span class="member-name-en">${escapeHtml(member.nameEn)}</span>`
            : '';

        const imgHtml = member.image
            ? `<img src="${escapeHtml(member.image)}" alt="${escapeHtml(member.nameKo)}" class="team-img member-hero-img">`
            : `<div class="member-photo-placeholder" aria-hidden="true"></div>`;

        const highlightsHtml = (member.highlights || []).length
            ? `
                <h2 class="h2-title" style="margin-top: 36px;">Profile</h2>
                <div class="about-card">
                    <ul class="member-highlights">
                        ${(member.highlights || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                    </ul>
                </div>
            `
            : '';

        const orderedMembers = window.__teamMembers || [];
        const index = orderedMembers.findIndex(m => m.id === member.id);
        const prevMember = index > 0 ? orderedMembers[index - 1] : null;
        const nextMember = index >= 0 && index < orderedMembers.length - 1 ? orderedMembers[index + 1] : null;

        const prevHtml = prevMember
            ? `<a class="member-pager-link prev" href="team-member.html?id=${encodeURIComponent(prevMember.id)}" aria-label="Previous member: ${escapeHtml(formatNavLabel(prevMember))}">◀ ${escapeHtml(formatNavLabel(prevMember))}</a>`
            : `<span class="member-pager-spacer" aria-hidden="true"></span>`;

        const nextHtml = nextMember
            ? `<a class="member-pager-link next" href="team-member.html?id=${encodeURIComponent(nextMember.id)}" aria-label="Next member: ${escapeHtml(formatNavLabel(nextMember))}">${escapeHtml(formatNavLabel(nextMember))} ▶</a>`
            : `<span class="member-pager-spacer" aria-hidden="true"></span>`;

        app.innerHTML = `
            <div class="team-card member-hero-card">
                <div class="team-content member-hero-content">
                    <p class="member-kicker">${escapeHtml(groupLabel)}</p>
                    <div class="team-header" style="margin-bottom: 10px;">
                        <h1 class="h1-title member-name">${escapeHtml(member.nameKo)}${nameEnHtml}</h1>
                        <span class="team-role">${escapeHtml(member.roleKo || '')}</span>
                    </div>
                </div>
                ${imgHtml}
            </div>
            ${highlightsHtml}
            <div class="member-pager" aria-label="Member navigation">
                ${prevHtml}
                <a class="member-pager-team" href="team.html" aria-label="Back to Team">Back to Team ▲</a>
                ${nextHtml}
            </div>
        `;
    };

    app.innerHTML = '<div class="team-card"><div class="team-content"><p class="team-bio" style="margin:0; color: var(--text-muted);">Loading...</p></div></div>';

    try {
        const response = await fetch('assets/team/team-manifest.json');
        const data = await response.json();
        const assetVersion = data.assetVersion || '';
        const rawMembers = Array.isArray(data) ? data : (data.members || []);

        const withVersion = (url) => {
            const raw = String(url || '').trim();
            const version = String(assetVersion || '').trim();
            if (!raw || !version) return raw;
            const separator = raw.includes('?') ? '&' : '?';
            return `${raw}${separator}v=${encodeURIComponent(version)}`;
        };

        const groupWeight = (group) => {
            if (group === 'core') return 0;
            if (group === 'advisory') return 1;
            return 2;
        };

        const members = rawMembers.slice().sort((a, b) => {
            const groupDiff = groupWeight(a.group) - groupWeight(b.group);
            if (groupDiff !== 0) return groupDiff;
            const orderDiff = (a.order ?? 0) - (b.order ?? 0);
            if (orderDiff !== 0) return orderDiff;
            return String(a.id || '').localeCompare(String(b.id || ''));
        }).map(member => ({
            ...member,
            image: withVersion(member.image)
        }));

        if (data.heroImage) {
            const heroSurface = document.querySelector('.page-hero .page-hero-surface');
            const heroImg = document.querySelector('.page-hero .page-hero-media img');
            const versionedHero = withVersion(data.heroImage);
            if (heroImg) heroImg.src = versionedHero;
            if (heroSurface) heroSurface.style.setProperty('--hero-image', `url('${versionedHero}')`);
        }

        const currentId = getUrlParam('id');
        if (!currentId) {
            renderMemberList(members);
            return;
        }

        const member = members.find(m => m.id === currentId);
        if (!member) {
            app.innerHTML = `
                <div class="about-card">
                    <p style="margin: 0; color: var(--text-muted);">존재하지 않는 멤버입니다.</p>
                </div>
            `;
            return;
        }

        window.__teamMembers = members;
        renderMemberDetail(member);
    } catch (error) {
        console.error('Failed to fetch team data:', error);
        app.innerHTML = `
            <div class="about-card">
                <p style="margin: 0; color: var(--text-muted);">팀 정보를 불러올 수 없습니다. (file:// 환경에서는 동작하지 않습니다.)</p>
            </div>
        `;
    }
});
