// Constantes para la gramática LL(1)
const EPSILON = 'ε';
const SIMBOLO_INICIAL = '$';

// Variables globales para almacenar la gramática y conjuntos First, Follow y tabla LL
let gramatica = [];
let firsts = {};
let follows = {};
let tabla_LL = {};

// Clase Gramatica para representar cada no terminal con sus producciones
class Gramatica {
    constructor(no_terminal) {
        this.no_terminal = no_terminal;
        this.producciones = [];
    }

    agregar_produccion(produccion) {
        this.producciones.push(produccion);
    }
}

// Función para mostrar el formulario inicial de ingreso de reglas de la gramática
function showInputForm() {
    document.getElementById('content').innerHTML = `
        <h2>Introduce las reglas de la gramática:</h2>
        <div>
            <label for="cantidad_reglas">Ingrese el número de reglas:</label>
            <input type="number" id="cantidad_reglas">
            <button onclick="leerGramatica()">Continuar</button>
        </div>
        <div id="reglas_form"></div>
    `;
}

// Función para leer y generar el formulario de ingreso de gramática según el número de reglas ingresado
function leerGramatica() {
    const cantidad_reglas = parseInt(document.getElementById('cantidad_reglas').value);
    let reglas_form = document.getElementById('reglas_form');
    reglas_form.innerHTML = '';

    for (let i = 0; i < cantidad_reglas; i++) {
        reglas_form.innerHTML += `
            <h3>Regla ${i + 1}</h3>
            <label for="no_terminal_${i}">Ingrese el símbolo no terminal (mayúscula):</label>
            <input type="text" id="no_terminal_${i}">
            <label for="cantidad_producciones_${i}">Ingrese el número de producciones:</label>
            <input type="number" id="cantidad_producciones_${i}">
            <div id="producciones_${i}"></div>
            <button onclick="agregarProducciones(${i})">Agregar Producciones</button>
        `;
    }
    reglas_form.innerHTML += '<button onclick="guardarGramatica()">Guardar Gramática</button>';
}

// Función para agregar las producciones a cada no terminal ingresado
function agregarProducciones(index) {
    const cantidad_producciones = parseInt(document.getElementById(`cantidad_producciones_${index}`).value);
    let producciones_div = document.getElementById(`producciones_${index}`);
    producciones_div.innerHTML = '';

    for (let i = 0; i < cantidad_producciones; i++) {
        producciones_div.innerHTML += `
            <label for="produccion_${index}_${i}">Producción ${i + 1}:</label>
            <input type="text" id="produccion_${index}_${i}">
        `;
    }
}

// Función para guardar la gramática ingresada y mostrarla en el contenido
function guardarGramatica() {
    gramatica = [];
    const cantidad_reglas = parseInt(document.getElementById('cantidad_reglas').value);

    for (let i = 0; i < cantidad_reglas; i++) {
        let no_terminal = document.getElementById(`no_terminal_${i}`).value.trim();
        let nueva_gramatica = new Gramatica(no_terminal);
        const cantidad_producciones = parseInt(document.getElementById(`cantidad_producciones_${i}`).value);

        for (let j = 0; j < cantidad_producciones; j++) {
            let produccion = document.getElementById(`produccion_${i}_${j}`).value.trim();
            nueva_gramatica.agregar_produccion(produccion);
        }

        gramatica.push(nueva_gramatica);
    }

    imprimirGramatica();
}

// Función para imprimir la gramática almacenada en el contenido
function imprimirGramatica() {
    let contenido = '<h2>Gramática:</h2>';
    gramatica.forEach(g => {
        contenido += `<p>${g.no_terminal} -> ${g.producciones.join(' | ')}</p>`;
    });
    document.getElementById('content').innerHTML = contenido;
}

// Función para verificar y eliminar recursión izquierda en la gramática
function checkAndEliminateRecursion() {
    if (!gramatica.length) {
        alert("Por favor, introduce primero las reglas de la gramática.");
        return;
    }

    if (tieneRecursionIzquierda()) {
        gramatica = eliminarRecursionIzquierda();
        alert("Se ha eliminado la recursión izquierda.");
    } else {
        alert("La gramática no tiene recursión izquierda.");
    }

    imprimirGramatica();
}

// Función para verificar si hay recursión izquierda en la gramática
function tieneRecursionIzquierda() {
    for (let g of gramatica) {
        for (let produccion of g.producciones) {
            if (produccion.startsWith(g.no_terminal)) {
                return true;
            }
        }
    }
    return false;
}

// Función para eliminar recursión izquierda de la gramática
function eliminarRecursionIzquierda() {
    let nueva_gramatica = [];

    gramatica.forEach(g => {
        let no_terminal = g.no_terminal;
        let alpha = [];
        let beta = [];

        g.producciones.forEach(produccion => {
            if (produccion.startsWith(no_terminal)) {
                alpha.push(produccion.substring(no_terminal.length));
            } else {
                beta.push(produccion);
            }
        });

        if (alpha.length > 0) {
            nueva_gramatica.push(new Gramatica(no_terminal));
            beta.forEach(b => {
                nueva_gramatica[nueva_gramatica.length - 1].agregar_produccion(`${b}${no_terminal}'`);
            });

            nueva_gramatica.push(new Gramatica(`${no_terminal}'`));
            alpha.forEach(a => {
                nueva_gramatica[nueva_gramatica.length - 1].agregar_produccion(`${a}${no_terminal}'`);
            });
            nueva_gramatica[nueva_gramatica.length - 1].agregar_produccion(EPSILON);
        } else {
            nueva_gramatica.push(g);
        }
    });

    return nueva_gramatica;
}

// Función para verificar y eliminar ambigüedad en la gramática
function checkAndEliminateAmbiguity() {
    if (!gramatica.length) {
        alert("Por favor, introduce primero las reglas de la gramática.");
        return;
    }

    if (tieneAmbiguedad()) {
        gramatica = eliminarAmbiguedad();
        alert("Se ha eliminado la ambigüedad.");
    } else {
        alert("La gramática no tiene ambigüedad.");
    }

    imprimirGramatica();
}

// Función para verificar si hay ambigüedad en la gramática
function tieneAmbiguedad() {
    for (let g of gramatica) {
        let prefijos = new Set();
        for (let produccion of g.producciones) {
            let prefijo = produccion[0];
            if (prefijos.has(prefijo)) {
                return true;
            }
            prefijos.add(prefijo);
        }
    }
    return false;
}

// Función para eliminar ambigüedad de la gramática
function eliminarAmbiguedad() {
    let nueva_gramatica = [];

    gramatica.forEach(g => {
        let no_terminal = g.no_terminal;
        let prefijos_comunes = {};

        g.producciones.forEach(produccion => {
            let prefijo = produccion[0];
            if (!(prefijo in prefijos_comunes)) {
                prefijos_comunes[prefijo] = [];
            }
            prefijos_comunes[prefijo].push(produccion);
        });

        nueva_gramatica.push(new Gramatica(no_terminal));

        Object.keys(prefijos_comunes).forEach(prefijo => {
            let prods = prefijos_comunes[prefijo];
            if (prods.length > 1) {
                let nuevo_no_terminal = `${no_terminal}'`;
                nueva_gramatica[nueva_gramatica.length - 1].agregar_produccion(`${prefijo}${nuevo_no_terminal}`);
                nueva_gramatica.push(new Gramatica(nuevo_no_terminal));
                prods.forEach(prod => {
                    nueva_gramatica[nueva_gramatica.length - 1].agregar_produccion(prod.substring(1) || EPSILON);
                });
            } else {
                nueva_gramatica[nueva_gramatica.length - 1].agregar_produccion(prods[0]);
            }
        });
    });

    return nueva_gramatica;
}

// Función para calcular conjuntos First de la gramática
function calculateFirstSets() {
    if (!gramatica.length) {
        alert("Por favor, introduce primero las reglas de la gramática.");
        return;
    }

    firsts = {};
    let terminales = new Set();

    gramatica.forEach(g => {
        firsts[g.no_terminal] = new Set();
        g.producciones.forEach(produccion => {
            produccion.split('').forEach(simbolo => {
                if (!simbolo.match(/[A-Z]/) && simbolo !== EPSILON) {
                    terminales.add(simbolo);
                }
            });
        });
    });

    terminales.forEach(terminal => {
        firsts[terminal] = new Set([terminal]);
    });

    let cambios = true;
    while (cambios) {
        cambios = false;
        gramatica.forEach(g => {
            g.producciones.forEach(produccion => {
                let primer_simbolo = produccion[0];
                if (!primer_simbolo.match(/[A-Z]/)) {
                    if (!firsts[g.no_terminal].has(primer_simbolo)) {
                        firsts[g.no_terminal].add(primer_simbolo);
                        cambios = true;
                    }
                } else {
                    let todos_epsilon = true;
                    produccion.split('').forEach(simbolo => {
                        if (!firsts[simbolo].has(EPSILON)) {
                            todos_epsilon = false;
                        }
                        firsts[simbolo].forEach(f => {
                            if (f !== EPSILON && !firsts[g.no_terminal].has(f)) {
                                firsts[g.no_terminal].add(f);
                                cambios = true;
                            }
                        });
                    });
                    if (todos_epsilon && !firsts[g.no_terminal].has(EPSILON)) {
                        firsts[g.no_terminal].add(EPSILON);
                        cambios = true;
                    }
                }
            });
        });
    }

    let contenido = '<h2>Conjuntos First:</h2>';
    Object.keys(firsts).forEach(no_terminal => {
        contenido += `<p>First(${no_terminal}) = { ${Array.from(firsts[no_terminal]).join(', ')} }</p>`;
    });
    document.getElementById('content').innerHTML = contenido;
}

// Función para calcular conjuntos Follow de la gramática
function calculateFollowSets() {
    if (!gramatica.length) {
        alert("Por favor, introduce primero las reglas de la gramática.");
        return;
    }

    follows = {};
    gramatica.forEach(g => {
        follows[g.no_terminal] = new Set();
    });
    follows[gramatica[0].no_terminal].add(SIMBOLO_INICIAL);

    let cambiando = true;
    while (cambiando) {
        cambiando = false;
        gramatica.forEach(g => {
            g.producciones.forEach(produccion => {
                const simbolos = produccion.split('');
                for (let i = 0; i < simbolos.length; i++) {
                    const simbolo = simbolos[i];
                    if (simbolo.match(/[A-Z]/)) {
                        const siguiente = simbolos.slice(i + 1);
                        if (siguiente.length > 0) {
                            for (const siguiente_simbolo of siguiente) {
                                if (siguiente_simbolo.match(/[A-Z]/)) {
                                    const prevSize = follows[simbolo].size;
                                    follows[simbolo] = new Set([...follows[simbolo], ...Array.from(firsts[siguiente_simbolo]).filter(f => f !== EPSILON)]);
                                    if (!firsts[siguiente_simbolo].has(EPSILON)) break;
                                    if (follows[simbolo].size > prevSize) cambiando = true;
                                } else {
                                    if (!follows[simbolo].has(siguiente_simbolo)) {
                                        follows[simbolo].add(siguiente_simbolo);
                                        cambiando = true;
                                    }
                                    break;
                                }
                            }
                        } else {
                            const prevSize = follows[simbolo].size;
                            follows[simbolo] = new Set([...follows[simbolo], ...follows[g.no_terminal]]);
                            if (follows[simbolo].size > prevSize) cambiando = true;
                        }
                    }
                }
            });
        });
    }

    let contenido = '<h2>Conjuntos Follow:</h2>';
    Object.keys(follows).forEach(no_terminal => {
        contenido += `<p>Follow(${no_terminal}) = { ${Array.from(follows[no_terminal]).join(', ')} }</p>`;
    });
    document.getElementById('content').innerHTML = contenido;
}



// Función auxiliar para obtener el conjunto First de una cadena de símbolos
function getFirst(cadena) {
    let conjunto_first = new Set();
    for (let i = 0; i < cadena.length; i++) {
        let simbolo = cadena[i];
        if (simbolo.match(/[A-Z]/)) {
            firsts[simbolo].forEach(f => {
                if (f !== EPSILON) {
                    conjunto_first.add(f);
                }
            });
            if (!firsts[simbolo].has(EPSILON)) {
                return conjunto_first;
            }
        } else {
            conjunto_first.add(simbolo);
            return conjunto_first;
        }
    }
    conjunto_first.add(EPSILON);
    return conjunto_first;
}

// Función para construir la tabla LL de análisis sintáctico
function buildLLTable() {
    if (!gramatica.length || Object.keys(firsts).length === 0 || Object.keys(follows).length === 0) {
        alert("Por favor, calcula primero los conjuntos First y Follow.");
        return;
    }

    tabla_LL = {};

    gramatica.forEach(g => {
        tabla_LL[g.no_terminal] = {};
        Object.keys(firsts).forEach(terminal => {
            tabla_LL[g.no_terminal][terminal] = "Error";
        });
    });

    // Añadir el símbolo $ como última columna
    gramatica.forEach(g => {
        tabla_LL[g.no_terminal][SIMBOLO_INICIAL] = "Error"; // Inicializar todas las entradas con "Error"
    });

    gramatica.forEach(g => {
        g.producciones.forEach(produccion => {
            let primeros_prod = getFirst(produccion);
            primeros_prod.forEach(p => {
                tabla_LL[g.no_terminal][p] = `${g.no_terminal} -> ${produccion}`;
            });
            if (primeros_prod.has(EPSILON)) {
                follows[g.no_terminal].forEach(f => {
                    if (f === SIMBOLO_INICIAL) {
                        tabla_LL[g.no_terminal][f] = `${g.no_terminal} -> ${EPSILON}`;
                    } else {
                        tabla_LL[g.no_terminal][f] = `${g.no_terminal} -> ${produccion}`;
                    }
                });
            }
        });
    });

    let contenido = '<h2>Tabla LL:</h2><table><tr><th></th>';
    
    const terminales = new Set();
    gramatica.forEach(g => {
        Object.keys(firsts).forEach(t => terminales.add(t));
    });

    terminales.forEach(terminal => {
        contenido += `<th>${terminal}</th>`;
    });

    // Agregar la columna del símbolo $
    contenido += `<th>${SIMBOLO_INICIAL}</th>`;

    contenido += '</tr>';

    Object.keys(tabla_LL).forEach(no_terminal => {
        contenido += `<tr><td>${no_terminal}</td>`;
        terminales.forEach(terminal => {
            contenido += `<td>${tabla_LL[no_terminal][terminal]}</td>`;
        });

        // Agregar la entrada correspondiente al símbolo $
        contenido += `<td>${tabla_LL[no_terminal][SIMBOLO_INICIAL]}</td>`;

        contenido += '</tr>';
    });

    contenido += '</table>';
    document.getElementById('content').innerHTML = contenido;
}





// Función para analizar una cadena de entrada según la tabla LL
// Función para analizar una cadena de entrada según la tabla LL
function analyzeString() {
    if (!gramatica.length || Object.keys(tabla_LL).length === 0) {
        alert("Por favor, construye primero la tabla LL.");
        return;
    }

    let cadena = prompt("Ingrese la cadena a analizar:");
    if (!cadena) return;

    let pila = [SIMBOLO_INICIAL, gramatica[0].no_terminal];
    let entrada = cadena.split('').concat(SIMBOLO_INICIAL);
    let paso = 1;
    let contenido = '<h2>Análisis de Cadena:</h2>';
    contenido += `<p><strong>Cadena de entrada:</strong> ${cadena}</p>`;
    contenido += '<table border="1"><tr><th>Paso</th><th>Pila</th><th>Entrada</th><th>Producción</th></tr>';

    while (pila.length > 0 && entrada.length > 0) {
        let simbolo_pila = pila.pop();
        let simbolo_entrada = entrada[0];

        if (simbolo_pila === simbolo_entrada) {
            entrada.shift();
        } else if (!simbolo_pila.match(/[A-Z]/)) {
            contenido += `<tr><td>${paso}</td><td>${pila.join(' ')}</td><td>${entrada.join('')}</td><td>Error: Se esperaba '${simbolo_pila}'</td></tr>`;
            break;
        } else {
            let produccion = tabla_LL[simbolo_pila][simbolo_entrada];
            if (!produccion || produccion === "Error") {
                contenido += `<tr><td>${paso}</td><td>${pila.join(' ')}</td><td>${entrada.join('')}</td><td>Error: No hay producción para (${simbolo_pila}, ${simbolo_entrada})</td></tr>`;
                break;
            } else {
                let partes_produccion = produccion.split('->')[1].trim();
                if (partes_produccion !== EPSILON) {
                    let produccion_array = partes_produccion.split('').reverse();
                    pila = pila.concat(produccion_array);
                }
                contenido += `<tr><td>${paso}</td><td>${pila.join(' ')}</td><td>${entrada.join('')}</td><td>${simbolo_pila} -> ${partes_produccion}</td></tr>`;
            }
        }
        paso++;
    }

    if (pila.length === 0 && entrada.length === 0) {
        contenido += `<tr><td>${paso}</td><td>${pila.join(' ')}</td><td>${entrada.join('')}</td><td><strong>Cadena Aceptada</strong></td></tr>`;
    } else {
        contenido += `<tr><td>${paso}</td><td>${pila.join(' ')}</td><td>${entrada.join('')}</td><td><strong>Error en la Cadena</strong></td></tr>`;
    }

    contenido += '</table>';
    document.getElementById('content').innerHTML = contenido;
}



// Función para salir del programa y mostrar un mensaje de finalización
function exitProgram() {
    document.getElementById('content').innerHTML = '<h2>Programa terminado.</h2>';
}
