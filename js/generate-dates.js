// Generowanie dat urodzenia
document.addEventListener('DOMContentLoaded', function() {
    // Dni
    const daySelect = document.getElementById('birth-day');
    if (daySelect) {
        for(let i = 1; i <= 31; i++) {
            daySelect.innerHTML += `<option value="${i}">${i}</option>`;
        }
    }
    
    // Miesiące
    const monthSelect = document.getElementById('birth-month');
    if (monthSelect) {
        const months = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                       'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
        months.forEach((month, index) => {
            monthSelect.innerHTML += `<option value="${index + 1}">${month}</option>`;
        });
    }
    
    // Lata
    const yearSelect = document.getElementById('birth-year');
    if (yearSelect) {
        const currentYear = new Date().getFullYear();
        for(let i = currentYear; i >= currentYear - 100; i--) {
            yearSelect.innerHTML += `<option value="${i}">${i}</option>`;
        }
    }
});