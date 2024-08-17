

function calcularApostas(odd1, odd2) {
  const valorTotal = 232.43;

  // Calcular os valores das apostas para que o ganho seja o mesmo
  const aposta1 = valorTotal / (1 + (odd1 / odd2));
  const aposta2 = valorTotal - aposta1;

  // Calcular os retornos
  const retorno1 = aposta1 * odd1;
  const retorno2 = aposta2 * odd2;

  // Calcular o lucro garantido
  const lucroGarantido = Math.min(retorno1, retorno2) - valorTotal;

  return {
    aposta1: aposta1.toFixed(2),
    aposta2: aposta2.toFixed(2),
    retorno1: retorno1.toFixed(2),
    retorno2: retorno2.toFixed(2),
    lucroGarantido: lucroGarantido.toFixed(2)
  };
}


const calcularPrincipal = async (old1, old2) => {
  const resultado = calcularApostas(old1, old2);
  const string = `Aposta 1: ${resultado.aposta1}\nAposta 2: ${resultado.aposta2}\nLucro: ${resultado.lucroGarantido}`
  return string
};

module.exports = calcularPrincipal;
