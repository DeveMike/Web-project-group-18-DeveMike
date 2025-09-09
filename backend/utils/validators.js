// Funktio 1: Tarkista sähköpostin muoto
const validateEmail = (email) => { 
    // pitää olla @-merkki ja piste domainissa
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Funktio 2: Tarkista salasanan vaatimukset
const validatePassword = (password) => {
    // Tarkistus 1: Onko vähintään 8 merkkiä?
    const minLength = password.length >= 8;
    
    // Tarkistus 2: Onko vähintään yksi iso kirjain (A-Z)?
    const hasUpperCase = /[A-Z]/.test(password);
    
    // Tarkistus 3: Onko vähintään yksi numero (0-9)?
    const hasNumber = /[0-9]/.test(password);
    
    // Palauta objekti jossa kaikki tiedot
    return {
        isValid: minLength && hasUpperCase && hasNumber,
        errors: {
            minLength: !minLength ? 'Salasanan tulee olla vähintään 8 merkkiä' : null,
            hasUpperCase: !hasUpperCase ? 'Salasanassa tulee olla vähintään yksi iso kirjain' : null,
            hasNumber: !hasNumber ? 'Salasanassa tulee olla vähintään yksi numero' : null
        }
    };
};

module.exports = {
    validateEmail,
    validatePassword
};