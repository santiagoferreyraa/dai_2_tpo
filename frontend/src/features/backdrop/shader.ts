/**
 * El shader del fondo iridiscente.
 *
 * Dibuja una superficie que fluye despacio y le pinta encima colores de interferencia —los que
 * hacen que una pompa de jabón o una mancha de aceite cambien de color según cómo les da la luz—.
 * No es una foto ni un video: son unas cuentas por píxel que corren en la placa de video.
 *
 * **Corre en WebGL 2 y no en WebGL 1, y es por una sola función.** `dFdx`/`dFdy` dan cuánto
 * cambia un valor de un píxel al de al lado, y de ahí sale la inclinación de la superficie, que
 * es lo que después ilumina los pliegues. En WebGL 1 esa función es una extensión opcional; sin
 * ella habría que evaluar el ruido tres veces por píxel en vez de una para sacar la pendiente a
 * mano. Es el triple de trabajo por un fondo, así que se pide WebGL 2 y, si no está, no se dibuja
 * nada: abajo queda el degradado de siempre, que ya se ve bien.
 */

/**
 * El vértice no lee ningún buffer: arma el triángulo a partir del número de vértice.
 *
 * Son tres vértices que cubren toda la pantalla —un triángulo más grande que ella, no dos que
 * forman un rectángulo—, así que no hace falta crear, llenar ni liberar ningún buffer. Un
 * triángulo en vez de dos además evita la costura diagonal del medio, donde la placa procesa dos
 * veces los píxeles del borde compartido.
 */
export const VERTEX_SHADER = `#version 300 es
void main() {
  vec2 corner = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
}
`

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

out vec4 fragColor;

uniform vec2 uResolution;
uniform float uTime;

/*
  La paleta, como cuatro vectores en vez de una lista de colores.

  Es la fórmula de coseno de Inigo Quilez: color = a + b * cos(2pi * (c * t + d)). Con doce
  números se describe un degradado que da la vuelta entera sin cortes ni bandas, y sobre todo se
  puede INTERPOLAR: al cambiar de tema, el fondo viaja de una paleta a la otra en vez de saltar.
  Con una lista de paradas de color eso sería mezclar dos listas de largo distinto.

  'a' es el color medio, 'b' cuánto se aleja de él, 'c' cuántas vueltas da y 'd' desde dónde
  arranca cada canal. Que los tres canales arranquen corridos es lo que produce la iridiscencia:
  el rojo, el verde y el azul llegan a su máximo en momentos distintos.
*/
uniform vec3 uPaletteA;
uniform vec3 uPaletteB;
uniform vec3 uPaletteC;
uniform vec3 uPaletteD;

uniform vec3 uSpecularColor;
uniform float uSpecularStrength;
/* Cuánto se pronuncian los pliegues. Alto exagera el relieve; bajo lo aplana. */
uniform float uRelief;

/* Cuántas unidades del espacio del shader entran en la pantalla. Fija el tamaño de las formas. */
const float SCALE = 1.1;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

/*
  Ruido de valor: aleatorio en cada punto de una grilla, interpolado suave en el medio.

  La curva 3t^2 - 2t^3 y no una interpolación lineal: con lineal se ven los bordes rectos de la
  grilla, porque la pendiente salta de golpe al cruzar de una celda a la siguiente.
*/
float noise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  vec2 t = f * f * (3.0 - 2.0 * f);

  float a = hash(cell);
  float b = hash(cell + vec2(1.0, 0.0));
  float c = hash(cell + vec2(0.0, 1.0));
  float d = hash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
}

/*
  Tres capas de ruido, cada una del doble de frecuencia y con bastante menos amplitud.

  Es lo que le da al resultado formas grandes con algo de detalle adentro, en vez de manchas todas
  del mismo tamaño. El 2.03 en vez de 2.0 rompe la alineación entre capas: con el doble exacto,
  los máximos de todas caen en los mismos lugares y aparece una cuadrícula.

  **Son tres y no más, y la amplitud cae rápido, por culpa de la iluminación.** El relieve sale de
  cuánto cambia la altura entre píxeles vecinos, y en esa cuenta las capas finas pesan mucho más
  de lo que se ven: una capa con la mitad de amplitud pero el doble de frecuencia aporta lo mismo
  a la pendiente que la anterior. Con cuatro capas al 50% el fondo se llenaba de vetas duras.
*/
float fbm(vec2 p) {
  float sum = 0.0;
  float amplitude = 0.6;

  for (int i = 0; i < 3; i++) {
    sum += amplitude * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    amplitude *= 0.34;
  }

  return sum;
}

/*
  La superficie: ruido al que se le deforma el espacio con otro ruido.

  Ese doblez es lo que separa esto de una mancha cualquiera. Preguntar por el valor en un punto
  desplazado —y que el desplazamiento sea a su vez ruido— estira y retuerce las formas, y de ahí
  salen los pliegues largos y curvos de la referencia en vez de burbujas redondas.

  Cada capa se mueve a su ritmo y en su dirección: si todas viajaran igual, el dibujo entero se
  desplazaría de costado como un papel tapiz y se notaría el truco.
*/
float surface(vec2 p, float t) {
  vec2 warp = vec2(
    fbm(p + vec2(0.0, 0.0) + vec2(0.06, -0.045) * t),
    fbm(p + vec2(5.2, 1.3) + vec2(-0.035, 0.055) * t)
  );

  return fbm(p + 1.5 * warp + vec2(0.02, 0.015) * t);
}

void main() {
  /*
    Se divide por el lado MENOR y no por el ancho: así las formas miden lo mismo en las dos
    direcciones. Dividiendo por el ancho, en una ventana apaisada saldrían aplastadas.
  */
  float shortSide = min(uResolution.x, uResolution.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / shortSide * SCALE;

  float height = surface(p, uTime);

  /*
    La inclinación de la superficie, sacada de cuánto cambia la altura entre un píxel y el de al
    lado. Se corrige por resolución para que el relieve se vea igual en una pantalla grande que
    en una chica: sin eso, al renderizar a menos resolución los píxeles son más grandes, la
    diferencia entre vecinos es mayor y todo se vería más abollado.
  */
  vec2 slope = vec2(dFdx(height), dFdy(height)) * (shortSide / SCALE);
  vec3 normal = normalize(vec3(-slope * uRelief, 1.0));

  vec3 view = vec3(0.0, 0.0, 1.0);
  vec3 light = normalize(vec3(-0.45, 0.75, 0.55));

  /*
    Fresnel: cuánto se aleja la superficie de mirar de frente. Es lo que hace que el color cambie
    justo en los bordes de los pliegues, que es donde una superficie nacarada tornasola.
  */
  float facing = pow(1.0 - clamp(normal.z, 0.0, 1.0), 1.4);

  float specular = pow(max(dot(reflect(-light, normal), view), 0.0), 14.0);

  /* La altura elige el color base y el Fresnel lo corre: de ahí sale el tornasol. */
  float t = height * 1.1 + facing * 0.35 + uTime * 0.008;
  vec3 color = uPaletteA + uPaletteB * cos(6.28318530718 * (uPaletteC * t + uPaletteD));

  color += uSpecularColor * specular * uSpecularStrength;

  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`
