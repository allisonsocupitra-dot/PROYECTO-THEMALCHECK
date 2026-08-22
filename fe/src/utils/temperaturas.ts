export type UnidadTemperatura = 'C' | 'F';

export const detectarUnidadTemperatura = (
  valor?: string | null,
  fallback: UnidadTemperatura = 'C'
): UnidadTemperatura => {
  if (!valor) return fallback;

  const unidad = valor.toUpperCase();
  if (unidad.includes('F') || unidad.includes('FAHRENHEIT')) return 'F';
  if (unidad.includes('C') || unidad.includes('CELSIUS')) return 'C';

  return fallback;
};

export const convertirTemperaturaACelsius = (
  temperatura: number,
  unidadOrigen: UnidadTemperatura = 'C'
): number => {
  if (unidadOrigen === 'F') {
    return Number(((temperatura - 32) * 5 / 9).toFixed(1));
  }

  return Number(temperatura.toFixed(1));
};

export const normalizarRangoTermico = ({
  temperaturaMin,
  temperaturaMax,
  unidadOrigen,
}: {
  temperaturaMin: number;
  temperaturaMax: number;
  unidadOrigen: UnidadTemperatura;
}) => {
  const min = convertirTemperaturaACelsius(temperaturaMin, unidadOrigen);
  const max = convertirTemperaturaACelsius(temperaturaMax, unidadOrigen);

  return {
    temperaturaMin: min,
    temperaturaMax: max,
  };
};

export const formatearTemperatura = (valor: number): string => Number(valor.toFixed(1)).toString();
