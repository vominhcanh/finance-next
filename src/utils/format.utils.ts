// Format currency
export const formatCurrency = (amount: number, currency: string = 'VND'): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

// Format number with thousand separator
export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('vi-VN').format(num);
};

// Format date
export const formatDate = (date: string | Date, format: string = 'DD/MM/YYYY'): string => {
    // This will be enhanced with dayjs later
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    if (format === 'DD/MM/YYYY') {
        return `${day}/${month}/${year}`;
    }
    return d.toLocaleDateString('vi-VN');
};
// Check if color is light
export const isLightColor = (color: string): boolean => {
    if (!color) return true; // Default to light if no color
    const hex = color.replace('#', '');
    // Handle short hex (e.g., FFF)
    const fullHex = hex.length === 3 ? hex.split('').map(x => x + x).join('') : hex;

    const c_r = parseInt(fullHex.substr(0, 2), 16);
    const c_g = parseInt(fullHex.substr(2, 2), 16);
    const c_b = parseInt(fullHex.substr(4, 2), 16);

    if (isNaN(c_r) || isNaN(c_g) || isNaN(c_b)) return true;

    const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
    return brightness > 128;
};
