async function validarNIF(nif) {
    if (!nif) {
        return {
            valid: false,
            message: 'O NIF é obrigatório.'
        };
    }

    const nifLimpo = String(nif).replace(/\D/g, '');
    if (!/^\d{9}$/.test(nifLimpo)) {
        return { valid: false, message: 'O NIF deve ter 9 dígitos.' };
    }

    const key = process.env.NIF_API_KEY;
    if (!key) {
        return { valid: false, message: 'A chave da API do NIF não está configurada.' };
    }

    const url = `https://www.nif.pt/?json=1&q=${encodeURIComponent(nifLimpo)}&key=${encodeURIComponent(key)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.nif_validation || !data.is_nif) {
            return { valid: false, message: 'NIF inválido.' };
        }

        return { valid: true, nif: nifLimpo};
    } catch (error) {
        return { valid: false, message: 'Não foi possível validar o NIF neste momento.' };
    }
}

module.exports = {
    validarNIF
};