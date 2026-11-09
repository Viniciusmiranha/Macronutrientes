"use strict";

(function (global) {
    function validarCPF(valor) {
        const cpf = String(valor || "").replace(/\D/g, "");
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

        for (let t = 9; t <= 10; t++) {
            let soma = 0;
            for (let i = 0; i < t; i++) {
                soma += Number(cpf.charAt(i)) * (t + 1 - i);
            }
            const digito = (soma * 10) % 11 % 10;
            if (digito !== Number(cpf.charAt(t))) return false;
        }

        return true;
    }

    global.NutriqValidacao = { validarCPF };
})(window);
