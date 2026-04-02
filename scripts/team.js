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

    const fallbackRoleEn = (member) => {
        const role = String(member?.roleKo || '').trim();

        if (role.includes('대표이사') && role.includes('회장')) return 'Chief Executive Officer / Chairman';
        if (role.includes('부사장') && role.includes('심사역')) return 'Vice President / Investment Director';
        if (role.includes('팀장') && role.includes('심사역')) return 'Team Lead / Investment Manager';
        if (role.includes('자문위원')) return 'Advisor';
        if (role.includes('교수')) return 'Professor';
        if (role.includes('CEO')) return 'Chief Executive Officer';
        if (role.includes('사외이사')) return 'Outside Director';
        if (role.includes('과장')) return 'Department Head';
        return role;
    };

    const getRoleEn = (member) => String(member?.roleEn || fallbackRoleEn(member) || '').trim();
    const getSummaryEn = (member) => String(member?.summaryEn || getRoleEn(member) || '').trim();

    const renderMemberCard = (member) => {
        const profileLabel = member.nameEn
            ? `${member.nameEn} profile`
            : `${member.nameKo} 프로필 보기`;
        const imageHtml = member.image
            ? `<img src="${escapeHtml(member.image)}" alt="${escapeHtml(member.nameEn || member.nameKo)}" class="team-img" loading="lazy" decoding="async">`
            : `<div class="member-photo-placeholder" aria-hidden="true"></div>`;

        return `
            <a class="team-card team-card-link team-card--stacked" href="team-member.html?id=${encodeURIComponent(member.id)}" aria-label="${escapeHtml(profileLabel)}">
                <div class="team-card-media team-card-media--portrait">
                    ${imageHtml}
                </div>
                <div class="team-card-copy">
                    <div class="team-header">
                        <h3 class="team-name">${escapeHtml(member.nameKo)}</h3>
                        ${member.nameEn ? `<p class="team-name-en">${escapeHtml(member.nameEn)}</p>` : ''}
                    </div>
                    <p class="team-role">${escapeHtml(member.roleKo || '')}</p>
                    ${getRoleEn(member) ? `<p class="team-role-en">${escapeHtml(getRoleEn(member))}</p>` : ''}
                    ${getSummaryEn(member) ? `<p class="team-card-summary">${escapeHtml(getSummaryEn(member))}</p>` : ''}
                </div>
            </a>
        `;
    };

    const renderMemberList = (members) => {
        const renderGroup = (label, group) => {
            const groupMembers = members.filter(m => m.group === group);
            if (groupMembers.length === 0) return '';
            const cardsHtml = groupMembers.map(renderMemberCard).join('');

            return `
                <section class="team-group">
                    <h2 class="h2-title">${escapeHtml(label)}</h2>
                    <div class="team-grid">
                        ${cardsHtml}
                    </div>
                </section>
            `;
        };

        app.innerHTML = `
            <div class="team-index-layout">
                ${renderGroup('Core Team', 'core')}
                ${renderGroup('Advisory Board', 'advisory')}
            </div>
        `;
    };

    const renderMemberDetail = (member) => {
        const groupLabel = member.group === 'core' ? 'Core Team' : 'Advisory Board';
        const nameEnHtml = member.nameEn
            ? `<span class="member-name-en">${escapeHtml(member.nameEn)}</span>`
            : '';

        const imgHtml = member.image
            ? `<img src="${escapeHtml(member.image)}" alt="${escapeHtml(member.nameKo)}" class="team-img member-hero-img" loading="eager" decoding="async">`
            : `<div class="member-photo-placeholder" aria-hidden="true"></div>`;

        const highlightsHtml = (member.highlights || []).length
            ? `
                <h2 class="h2-title member-profile-title">Profile</h2>
                <div class="about-card member-profile-card">
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
            <article class="team-card member-hero-card member-hero-card--stacked">
                <div class="team-card-media team-card-media--portrait">
                    ${imgHtml}
                </div>
                <div class="team-card-copy member-hero-content">
                    <p class="member-kicker">${escapeHtml(groupLabel)}</p>
                    <div class="member-identity">
                        <h1 class="h1-title member-name">${escapeHtml(member.nameKo)}${nameEnHtml}</h1>
                        <p class="team-role">${escapeHtml(member.roleKo || '')}</p>
                        ${getRoleEn(member) ? `<p class="team-role-en">${escapeHtml(getRoleEn(member))}</p>` : ''}
                        ${getSummaryEn(member) ? `<p class="team-card-summary">${escapeHtml(getSummaryEn(member))}</p>` : ''}
                    </div>
                </div>
            </article>
            ${highlightsHtml}
            <div class="member-pager" aria-label="Member navigation">
                ${prevHtml}
                <a class="member-pager-team" href="team.html" aria-label="Back to Team">Back to Team ▲</a>
                ${nextHtml}
            </div>
        `;
    };

    app.innerHTML = `
        <div class="team-card team-loading-card">
            <div class="team-content">
                <p class="team-bio team-loading-copy">Loading...</p>
            </div>
        </div>
    `;

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

        window.__teamMembers = members;

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
