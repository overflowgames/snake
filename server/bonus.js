/*jslint node: true*/

function surunserpent(coord, snakes) {
    'use strict';
    var i, j, sx, sy;
    for (i in snakes) {
        if (snakes.hasOwnProperty(i)) {
            for (j = 0; j < snakes[i].coords.length; j += 1) {
                if (snakes[i].coords[j + 1] !== undefined) {
                    sx = snakes[i].coords[j][0];
                    sy = snakes[i].coords[j][1];
                    if (((coord[0] >= Math.min(sx, snakes[i].coords[j + 1][0])) && (coord[0] <= Math.max(sx, snakes[i].coords[j + 1][0])) && (sy === coord[1])) || ((coord[1] >= Math.min(sy, snakes[i].coords[j + 1][1])) && (coord[1] <= Math.max(sy, snakes[i].coords[j + 1][1])) && (sx === coord[0]))) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function surunbonus(coord, bonus) {
    'use strict';
    var i;
    for (i in bonus) {
        if (bonus.hasOwnProperty(i)) {
            if (bonus[i][1][0] === coord[0] && bonus[i][1][1] === coord[1]) {
                return true;
            }
        }
    }
    return false;
}

/// Calcule la probabilité pour le point (x,y) à partir d'un snake (px,py)
function matrix_pos(x, y, px, py, probability_matrix) {
    'use strict';

    var delta_total = Math.abs(x - px) + Math.abs(y - py),
        max_val = 5;

    if (delta_total > max_val) {
        delta_total = 2 * max_val - delta_total;
    }

    if ((delta_total > 0) && (delta_total <= max_val)) {
        if (probability_matrix[px] === undefined) {
            probability_matrix[px] = [];
        }

        if (probability_matrix[px][py] === undefined) {
            probability_matrix[px][py] = 0;
        }

        probability_matrix[px][py] += delta_total;
    }
    return probability_matrix;
}
/// Met à jour la matrice des probabilités pour un snake positionné en (x,y) et dirigé vers direction.
function update_probs(x, y, direction, probability_matrix) {
    'use strict';
    var void_radius = 2,
        max_val = 5,
        px,
        py;

    if (direction === "u" || direction === "d") {
        for (px = x - max_val * 2 + 1 - void_radius + 1; px <= x + max_val * 2 - 1 + void_radius - 1; px += 1) {
            if (px <= x - void_radius || px >= x + void_radius) {
                if (direction === "u") {
                    for (py = y - max_val * 2 + 1; py <= y; py += 1) {
                        probability_matrix = matrix_pos(x, y, px, py, probability_matrix);
                    }
                } else {
                    for (py = y; py <= y + max_val * 2 - 1; py += 1) {
                        probability_matrix = matrix_pos(x, y, px, py, probability_matrix);
                    }
                }
            }
        }
    } else {
        for (py = y - max_val * 2 + 1 - void_radius + 1; py <= y + max_val * 2 - 1 + void_radius - 1; py += 1) {
            if (py <= y - void_radius || px >= y + void_radius) {
                if (direction === "l") {
                    for (px = x - max_val * 2 + 1; px <= x; px += 1) {
                        probability_matrix = matrix_pos(x, y, px, py, probability_matrix);
                    }
                } else {
                    for (px = x; px <= x + max_val * 2 - 1; px += 1) {
                        probability_matrix = matrix_pos(x, y, px, py, probability_matrix);
                    }
                }
            }
        }
    }
    return probability_matrix;
}

function genBonusCoords(snakes, bonus) {
    'use strict';
    var i,
        currentSnake,
        probability_matrix = [],
        sum = 0, // Somme des probabilités
        probs = [], // Probabilité à l'index i
        probx = [], // Position x de la probabilité à l'index i
        proby = [], // Position y de la probabilité à l'index i
        x,
        y,
        r,
        ecc = 0,
        index,
        coord;

    /*
     * Génération du tableau des probabilités.
     */
    for (i in snakes) {
        if (snakes.hasOwnProperty(i)) {
            currentSnake = snakes[i];
            if (currentSnake.coords !== undefined) {
                probability_matrix = update_probs(currentSnake.coords[0][0], currentSnake.coords[0][1], currentSnake.direction, probability_matrix);
            }
        }
    }

    /*
     * Préparation du traitement des probabilités.
     */


    for (x in probability_matrix) {
        if (probability_matrix.hasOwnProperty(x)) {
            for (y in probability_matrix[x]) {
                if (probability_matrix[x].hasOwnProperty(y)) {
                    sum += probability_matrix[x][y];
                    probs.push(probability_matrix[x][y]);
                    probx.push(x);
                    proby.push(y);
                }
            }
        }
    }

    /*
     * Sélection d'une coordonnée aléatoire selon les probabilités.
     */

    r = Math.ceil(Math.random() * sum);

    for (index = 0; index < probs.length; index += 1) {
        ecc += probs[index];
        if (ecc >= r) {
            coord = [parseInt(probx[index], 10), parseInt(proby[index], 10)];

            if (!surunserpent(coord, snakes) && !surunbonus(coord, bonus)) {
                return coord;
            }
        }
    }
}

module.exports.genBonusCoords = genBonusCoords;