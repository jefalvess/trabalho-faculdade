function calcularApostasParaGanhoIgual(total, old1, old2) {
  // Verifica se old1 e old2 são diferentes de zero para evitar divisão por zero
  if (old1 === 0 || old2 === 0) {
    throw new Error("Os valores de 'old' não podem ser zero.");
  }
  // Calcular a fração do total que deve ser apostada em cada odd
  const fração1 = 1 / old1;
  const fração2 = 1 / old2;
  const somaFrações = fração1 + fração2;

  // Calcular o valor a ser apostado em cada odd
  const aposta1 = (fração1 / somaFrações) * total;
  const aposta2 = (fração2 / somaFrações) * total;

  const retorno1 = aposta1 * old1;
  const retorno2 = aposta2 * old2;
  const lucroGarantido = Math.min(retorno1, retorno2) - total;

  return { aposta1, aposta2, lucroGarantido };
}

function calculatePercentage(value, total) {
  if (total === 0) {
    throw new Error("O valor total não pode ser zero.");
  }
  const percentage = (value / total) * 100;
  return percentage.toFixed(2); // Retorna o resultado com duas casas decimais
}

function calcularTotalAposta(old1, old2) {
  // Determinar o menor valor entre Old 1 e Old 2
  const menorOld = Math.min(old1, old2);

  // Garantir que a menor aposta seja 100 reais
  const apostaMinima = 100;

  // Calcular o fator de ajuste
  const fatorAjuste = apostaMinima / menorOld;

  // Calcular o total da aposta
  const totalAposta = old1 * fatorAjuste + old2 * fatorAjuste;

  return totalAposta;
}

const calcularPrincipal = async (old1, old2) => {
  const aposta = calcularTotalAposta(old1, old2);
  const resultado = calcularApostasParaGanhoIgual(aposta, old1, old2);
  const string = `Aposta 1: ${resultado.aposta1.toFixed(2)}\nAposta 2: ${resultado.aposta2.toFixed(2)}\nLucro: ${resultado.lucroGarantido.toFixed(2)}`
  return string
};

module.exports = calcularPrincipal;
