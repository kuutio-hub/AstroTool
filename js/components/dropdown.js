export function createDropdown(title, contentHTML, isNightMode) {
    const container = document.createElement('div');
    container.className = "relative inline-block text-left w-full";

    const button = document.createElement('button');
    button.type = "button";
    button.className = `flex justify-between items-center w-full px-4 py-2 text-sm font-medium rounded-md shadow-sm astro-card hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isNightMode ? 'focus:ring-red-500 text-red-500' : 'focus:ring-blue-500 text-white'}`;
    button.innerHTML = `
        <span>${title}</span>
        <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
    `;

    const menu = document.createElement('div');
    menu.className = `origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 hidden astro-dropdown-menu`;
    menu.innerHTML = `<div class="py-1 px-4" role="none">${contentHTML}</div>`;

    let isOpen = false;

    button.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent bubbling
        isOpen = !isOpen;
        if (isOpen) {
            menu.classList.remove('hidden');
        } else {
            menu.classList.add('hidden');
        }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (isOpen && !container.contains(e.target)) {
            isOpen = false;
            menu.classList.add('hidden');
        }
    });

    // Prevent closing when clicking inside the menu
    menu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    container.appendChild(button);
    container.appendChild(menu);

    return container;
}
