document.addEventListener("DOMContentLoaded", function () {
    const currentPath = window.location.pathname;
    const baseUrl = window.location.origin;
    let navItems = document.getElementById("navigation").getElementsByTagName("a");
    for (let i = 0; i < navItems.length; i++) {
        if (navItems[i].classList.contains('active')) {
            navItems[i].classList.remove('active');
        }
        if (navItems[i].href.split(baseUrl)[1] === currentPath) {
            navItems[i].classList.add('active');
        }
    }
});