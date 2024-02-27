setTimeout(
function changeTextColor()
{
    
    // Get all the menu-item elements
    const menuItems = document.querySelectorAll('.media-item-lastfm');

    // Iterate over each menu-item
    menuItems.forEach((menuItem) => {
    // Get the background color of the current menu-item
    const computedStyle = getComputedStyle(menuItem);
    const backgroundColor = computedStyle ? computedStyle.backgroundColor : null;

    // Check if the background color is available
    if (backgroundColor) {
        // Calculate the most legible text color based on the background color
        const textColor = getContrastColor(backgroundColor);

        // Add the text color as a CSS attribute to the inline style of the current menu-item
        menuItem.style.color = textColor;
    }
    });

    // Function to calculate the most legible text color based on the background color
    function getContrastColor(backgroundColor) {
    // Calculate the relative luminance of a color using the sRGB color space
    function getRelativeLuminance(color) {
        const rgb = color.match(/\d+/g);
        if (!rgb) return 0;

        const [r, g, b] = rgb.map(Number);
        const [sR, sG, sB] = [r / 255, g / 255, b / 255];

        const rLuminance = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
        const gLuminance = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
        const bLuminance = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);

        return 0.2126 * rLuminance + 0.7152 * gLuminance + 0.0722 * bLuminance;
    }

    // Determine the most legible text color based on the background color
    const luminance = getRelativeLuminance(backgroundColor);
    return luminance > 0.5 ? '#000000' : '#ffffff';
    }




}, 5000);