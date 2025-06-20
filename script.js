// ===== CONFIGURACIÓN GLOBAL =====
const CONFIG = {
    minLength: 4,
    maxLength: 128,
    defaultLength: 12,
    maxHistoryItems: 10
};

// ===== CARACTERES DISPONIBLES =====
const CHARACTERS = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// ===== ELEMENTOS DEL DOM =====
const elements = {
    lengthSlider: document.getElementById('length'),
    lengthValue: document.getElementById('lengthValue'),
    uppercaseCheck: document.getElementById('uppercase'),
    lowercaseCheck: document.getElementById('lowercase'),
    numbersCheck: document.getElementById('numbers'),
    symbolsCheck: document.getElementById('symbols'),
    generateBtn: document.getElementById('generateBtn'),
    passwordDisplay: document.getElementById('passwordDisplay'),
    copyBtn: document.getElementById('copyBtn'),
    strengthText: document.getElementById('strengthText'),
    strengthFill: document.getElementById('strengthFill'),
    strengthScore: document.getElementById('strengthScore'),
    strengthDetails: document.getElementById('strengthDetails'),
    strengthContainer: document.querySelector('.strength-container'),
    historyList: document.getElementById('historyList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn')
};

// ===== ESTADO DE LA APLICACIÓN =====
let currentPassword = '';
let passwordHistory = JSON.parse(localStorage.getItem('passwordHistory')) || [];

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Generador de Contraseñas iniciado');
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    updateLengthDisplay();
    loadHistory();
    
    // Generar una contraseña inicial
    generatePassword();
    
    console.log('✅ Aplicación inicializada correctamente');
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Slider de longitud
    elements.lengthSlider.addEventListener('input', updateLengthDisplay);
    
    // Botón generar
    elements.generateBtn.addEventListener('click', generatePassword);
    
    // Botón copiar
    elements.copyBtn.addEventListener('click', copyToClipboard);
    
    // Botón limpiar historial
    elements.clearHistoryBtn.addEventListener('click', clearHistory);
    
    // Enter key en cualquier parte
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            generatePassword();
        }
    });
    
    // Validar que al menos una opción esté seleccionada
    [elements.uppercaseCheck, elements.lowercaseCheck, 
     elements.numbersCheck, elements.symbolsCheck].forEach(checkbox => {
        checkbox.addEventListener('change', validateOptions);
    });
}

// ===== FUNCIONES PRINCIPALES =====

/**
 * Actualiza el display de la longitud del slider
 */
function updateLengthDisplay() {
    const length = elements.lengthSlider.value;
    elements.lengthValue.textContent = length;
}

/**
 * Valida que al menos una opción esté seleccionada
 */
function validateOptions() {
    const anyChecked = [
        elements.uppercaseCheck.checked,
        elements.lowercaseCheck.checked,
        elements.numbersCheck.checked,
        elements.symbolsCheck.checked
    ].some(checked => checked);
    
    elements.generateBtn.disabled = !anyChecked;
    
    if (!anyChecked) {
        showMessage('Debes seleccionar al menos un tipo de caracter', 'warning');
    }
}

/**
 * Función principal para generar contraseñas
 */
function generatePassword() {
    try {
        const options = getPasswordOptions();
        
        if (!validatePasswordOptions(options)) {
            return;
        }
        
        const password = createPassword(options);
        displayPassword(password);
        evaluatePasswordStrength(password);
        addToHistory(password);
        
        // Animación del botón
        animateButton(elements.generateBtn);
        
        console.log(`✅ Contraseña generada: ${password.length} caracteres`);
        
    } catch (error) {
        console.error('❌ Error generando contraseña:', error);
        showMessage('Error al generar la contraseña', 'error');
    }
}

/**
 * Obtiene las opciones seleccionadas por el usuario
 */
function getPasswordOptions() {
    return {
        length: parseInt(elements.lengthSlider.value),
        includeUppercase: elements.uppercaseCheck.checked,
        includeLowercase: elements.lowercaseCheck.checked,
        includeNumbers: elements.numbersCheck.checked,
        includeSymbols: elements.symbolsCheck.checked
    };
}

/**
 * Valida las opciones de la contraseña
 */
function validatePasswordOptions(options) {
    // Verificar longitud
    if (options.length < CONFIG.minLength || options.length > CONFIG.maxLength) {
        showMessage(`La longitud debe estar entre ${CONFIG.minLength} y ${CONFIG.maxLength}`, 'error');
        return false;
    }
    
    // Verificar que al menos una opción esté seleccionada
    const hasAnyOption = options.includeUppercase || options.includeLowercase || 
                        options.includeNumbers || options.includeSymbols;
    
    if (!hasAnyOption) {
        showMessage('Debes seleccionar al menos un tipo de caracter', 'error');
        return false;
    }
    
    return true;
}

/**
 * Crea la contraseña según las opciones
 */
function createPassword(options) {
    let availableChars = '';
    let guaranteedChars = '';
    
    // Construir el conjunto de caracteres disponibles
    if (options.includeUppercase) {
        availableChars += CHARACTERS.uppercase;
        guaranteedChars += getRandomChar(CHARACTERS.uppercase);
    }
    
    if (options.includeLowercase) {
        availableChars += CHARACTERS.lowercase;
        guaranteedChars += getRandomChar(CHARACTERS.lowercase);
    }
    
    if (options.includeNumbers) {
        availableChars += CHARACTERS.numbers;
        guaranteedChars += getRandomChar(CHARACTERS.numbers);
    }
    
    if (options.includeSymbols) {
        availableChars += CHARACTERS.symbols;
        guaranteedChars += getRandomChar(CHARACTERS.symbols);
    }
    
    // Completar la contraseña con caracteres aleatorios
    let password = guaranteedChars;
    const remainingLength = options.length - guaranteedChars.length;
    
    for (let i = 0; i < remainingLength; i++) {
        password += getRandomChar(availableChars);
    }
    
    // Mezclar los caracteres para que no sean predecibles
    return shuffleString(password);
}

/**
 * Obtiene un caracter aleatorio de una cadena
 */
function getRandomChar(str) {
    return str[Math.floor(Math.random() * str.length)];
}

/**
 * Mezcla los caracteres de una cadena
 */
function shuffleString(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

/**
 * Muestra la contraseña generada
 */
function displayPassword(password) {
    currentPassword = password;
    elements.passwordDisplay.value = password;
    
    // Animación de aparición
    elements.passwordDisplay.style.animation = 'none';
    setTimeout(() => {
        elements.passwordDisplay.style.animation = 'fadeIn 0.5s ease-out';
    }, 10);
}

// ===== EVALUACIÓN DE SEGURIDAD =====

/**
 * Evalúa la fortaleza de la contraseña
 */
function evaluatePasswordStrength(password) {
    const analysis = analyzePassword(password);
    displayStrengthResults(analysis);
}

/**
 * Analiza la contraseña y calcula su puntuación
 */
function analyzePassword(password) {
    let score = 0;
    const criteria = [];
    
    // Longitud
    if (password.length >= 8) {
        score += 20;
        criteria.push({ text: 'Longitud adecuada (8+ caracteres)', met: true });
    } else {
        criteria.push({ text: 'Muy corta (mínimo 8 caracteres)', met: false });
    }
    
    if (password.length >= 12) {
        score += 10;
        criteria.push({ text: 'Longitud excelente (12+ caracteres)', met: true });
    }
    
    // Mayúsculas
    if (/[A-Z]/.test(password)) {
        score += 15;
        criteria.push({ text: 'Contiene mayúsculas', met: true });
    } else {
        criteria.push({ text: 'Sin mayúsculas', met: false });
    }
    
    // Minúsculas
    if (/[a-z]/.test(password)) {
        score += 15;
        criteria.push({ text: 'Contiene minúsculas', met: true });
    } else {
        criteria.push({ text: 'Sin minúsculas', met: false });
    }
    
    // Números
    if (/[0-9]/.test(password)) {
        score += 15;
        criteria.push({ text: 'Contiene números', met: true });
    } else {
        criteria.push({ text: 'Sin números', met: false });
    }
    
    // Símbolos
    if (/[^a-zA-Z0-9]/.test(password)) {
        score += 25;
        criteria.push({ text: 'Contiene símbolos especiales', met: true });
    } else {
        criteria.push({ text: 'Sin símbolos especiales', met: false });
    }
    
    // Variedad de caracteres
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.7) {
        score += 10;
        criteria.push({ text: 'Buena variedad de caracteres', met: true });
    }
    
    // Determinar nivel de seguridad
    let level, className;
    if (score >= 85) {
        level = 'Muy Fuerte';
        className = 'strength-strong';
    } else if (score >= 70) {
        level = 'Fuerte';
        className = 'strength-good';
    } else if (score >= 50) {
        level = 'Moderada';
        className = 'strength-fair';
    } else {
        level = 'Débil';
        className = 'strength-weak';
    }
    
    return { score, level, className, criteria };
}

/**
 * Muestra los resultados de la evaluación de seguridad
 */
function displayStrengthResults(analysis) {
    // Actualizar texto y puntuación
    elements.strengthText.textContent = analysis.level;
    elements.strengthScore.textContent = `${analysis.score}/100`;
    
    // Actualizar clase del contenedor
    elements.strengthContainer.className = `strength-container ${analysis.className}`;
    
    // Mostrar criterios detallados
    elements.strengthDetails.innerHTML = analysis.criteria.map(criterion => 
        `<div class="strength-criterion ${criterion.met ? 'met' : 'not-met'}">
            <i class="fas fa-${criterion.met ? 'check' : 'times'}"></i>
            ${criterion.text}
        </div>`
    ).join('');
    
    // Animación de la barra de progreso
    setTimeout(() => {
        elements.strengthFill.style.width = `${analysis.score}%`;
    }, 100);
}

// ===== GESTIÓN DEL PORTAPAPELES =====

/**
 * Copia la contraseña al portapapeles
 */
async function copyToClipboard() {
    if (!currentPassword) {
        showMessage('No hay contraseña para copiar', 'warning');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(currentPassword);
        showMessage('Contraseña copiada al portapapeles', 'success');
        
        // Animación del botón
        animateButton(elements.copyBtn);
        
        // Cambiar icono temporalmente
        const icon = elements.copyBtn.querySelector('i');
        const originalClass = icon.className;
        icon.className = 'fas fa-check';
        
        setTimeout(() => {
            icon.className = originalClass;
        }, 2000);
        
    } catch (error) {
        console.error('Error copiando al portapapeles:', error);
        showMessage('Error al copiar. Tu navegador no soporta esta función.', 'error');
    }
}

// ===== GESTIÓN DEL HISTORIAL =====

/**
 * Añade una contraseña al historial
 */
function addToHistory(password) {
    const historyItem = {
        password: password,
        timestamp: new Date().toLocaleString('es-ES'),
        strength: analyzePassword(password).level
    };
    
    // Evitar duplicados
    passwordHistory = passwordHistory.filter(item => item.password !== password);
    
    // Añadir al principio
    passwordHistory.unshift(historyItem);
    
    // Limitar el número de elementos
    if (passwordHistory.length > CONFIG.maxHistoryItems) {
        passwordHistory = passwordHistory.slice(0, CONFIG.maxHistoryItems);
    }
    
    saveHistory();
    displayHistory();
}

/**
 * Guarda el historial en localStorage
 */
function saveHistory() {
    try {
        localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
    } catch (error) {
        console.error('Error guardando historial:', error);
    }
}

/**
 * Carga el historial desde localStorage
 */
function loadHistory() {
    displayHistory();
}

/**
 * Muestra el historial en la interfaz
 */
function displayHistory() {
    if (passwordHistory.length === 0) {
        elements.historyList.innerHTML = '<p class="no-history">No hay contraseñas generadas aún</p>';
        return;
    }
    
    elements.historyList.innerHTML = passwordHistory.map((item, index) => 
        `<div class="history-item">
            <div class="history-info">
                <div class="history-password">${item.password}</div>
                <div class="history-meta">
                    <small>
                        <i class="fas fa-clock"></i> ${item.timestamp} | 
                        <i class="fas fa-shield-alt"></i> ${item.strength}
                    </small>
                </div>
            </div>
            <div class="history-actions">
                <button class="btn-small btn-copy-small" onclick="copyHistoryPassword('${item.password}')">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="btn-small btn-delete" onclick="removeFromHistory(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>`
    ).join('');
}

/**
 * Copia una contraseña del historial
 */
async function copyHistoryPassword(password) {
    try {
        await navigator.clipboard.writeText(password);
        showMessage('Contraseña del historial copiada', 'success');
    } catch (error) {
        showMessage('Error al copiar', 'error');
    }
}

/**
 * Elimina una contraseña del historial
 */
function removeFromHistory(index) {
    passwordHistory.splice(index, 1);
    saveHistory();
    displayHistory();
    showMessage('Contraseña eliminada del historial', 'info');
}

/**
 * Limpia todo el historial
 */
function clearHistory() {
    if (passwordHistory.length === 0) {
        showMessage('El historial ya está vacío', 'info');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres limpiar todo el historial?')) {
        passwordHistory = [];
        saveHistory();
        displayHistory();
        showMessage('Historial limpiado', 'info');
    }
}

// ===== UTILIDADES =====

/**
 * Muestra mensajes al usuario
 */
function showMessage(text, type = 'info') {
    // Crear elemento de mensaje
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.innerHTML = `
        <i class="fas fa-${getMessageIcon(type)}"></i>
        ${text}
    `;
    
    // Estilos del mensaje
    Object.assign(messageEl.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '1000',
        animation: 'fadeIn 0.3s ease-out',
        maxWidth: '300px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
    });
    
    // Color según el tipo
    const colors = {
        success: '#48bb78',
        error: '#f56565',
        warning: '#ed8936',
        info: '#667eea'
    };
    
    messageEl.style.background = colors[type] || colors.info;
    
    // Añadir al DOM
    document.body.appendChild(messageEl);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        messageEl.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            if (document.body.contains(messageEl)) {
                document.body.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}

/**
 * Obtiene el icono para el tipo de mensaje
 */
function getMessageIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

/**
 * Anima un botón
 */
function animateButton(button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 150);
}

// ===== CSS ADICIONAL PARA MENSAJES =====
const additionalCSS = `
@keyframes fadeOut {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(20px); }
}

.history-info {
    flex: 1;
}

.history-meta {
    margin-top: 0.5rem;
    color: #666;
}

.history-meta i {
    margin-right: 0.25rem;
}
`;

// Añadir CSS adicional
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);

// ===== FUNCIONES GLOBALES =====
// Estas funciones necesitan estar en el scope global para los onclick
window.copyHistoryPassword = copyHistoryPassword;
window.removeFromHistory = removeFromHistory;

console.log('🚀 Script cargado completamente');