function updateUserAvatar() {
    const user = getCurrentUser();
    if (user && user.avatar) {
        const avatarSmall = document.getElementById('userAvatarSmall');
        const avatarLarge = document.getElementById('userAvatarLarge');
        const defaultSmall = document.getElementById('defaultAvatarSmall');
        const defaultLarge = document.getElementById('defaultAvatarLarge');
        
        if (avatarSmall) {
            avatarSmall.src = user.avatar;
            avatarSmall.style.display = 'block';
            if (defaultSmall) defaultSmall.style.display = 'none';
        }
        if (avatarLarge) {
            avatarLarge.src = user.avatar;
            avatarLarge.style.display = 'block';
            if (defaultLarge) defaultLarge.style.display = 'none';
        }
    }
}

function updateBrandingLink() {
    const brandingLink = document.getElementById('brandingLink');
    if (brandingLink) {
        brandingLink.href = 'https://pratik11500.github.io/PratikPortfolio/';
        brandingLink.target = '_blank';
    }
}

function ensureAvatarElements() {
    const accountCircle = document.getElementById('accountCircle');
    if (accountCircle && !document.getElementById('userAvatarSmall')) {
        const existingSvg = accountCircle.querySelector('svg');
        if (existingSvg) {
            existingSvg.id = 'defaultAvatarSmall';
            const avatarImg = document.createElement('img');
            avatarImg.id = 'userAvatarSmall';
            avatarImg.alt = 'Avatar';
            avatarImg.style.cssText = 'width: 100%; height: 100%; border-radius: 50%; display: none;';
            accountCircle.insertBefore(avatarImg, existingSvg);
        }
    }
    
    const avatarLargeContainer = document.querySelector('.profile-avatar-large');
    if (avatarLargeContainer && !document.getElementById('userAvatarLarge')) {
        const existingSvg = avatarLargeContainer.querySelector('svg');
        if (existingSvg) {
            existingSvg.id = 'defaultAvatarLarge';
            const avatarImg = document.createElement('img');
            avatarImg.id = 'userAvatarLarge';
            avatarImg.alt = 'Avatar';
            avatarImg.style.cssText = 'width: 100%; height: 100%; border-radius: 50%; display: none;';
            avatarLargeContainer.insertBefore(avatarImg, existingSvg);
        }
    }
}

function ensureClickableBranding() {
    const madeByDiv = document.querySelector('.made-by');
    if (madeByDiv && madeByDiv.tagName !== 'A') {
        const anchor = document.createElement('a');
        anchor.href = 'https://pratik11500.github.io/PratikPortfolio/';
        anchor.target = '_blank';
        anchor.className = 'made-by';
        anchor.id = 'brandingLink';
        anchor.style.cssText = 'text-decoration: none; color: inherit; cursor: pointer;';
        anchor.innerHTML = madeByDiv.innerHTML;
        madeByDiv.parentNode.replaceChild(anchor, madeByDiv);
    } else if (madeByDiv && madeByDiv.tagName === 'A') {
        madeByDiv.href = 'https://pratik11500.github.io/PratikPortfolio/';
        madeByDiv.target = '_blank';
    }
}

function initializeLayout() {
    ensureAvatarElements();
    ensureClickableBranding();
    updateBrandingLink();
    
    const user = getCurrentUser();
    if (user) {
        updateUserAvatar();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLayout);
} else {
    initializeLayout();
}
