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
