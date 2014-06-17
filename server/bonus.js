/*jslint node: true*/

function surunserpent(coord, snakes) {
    'use strict';
    var i, j, k, acc = 0;
    for (i in snakes) {
        if (snakes.hasOwnProperty(i)) {
            for (j = 0; j < snakes[i].coords.length; j += 1) {
                if (snakes[i].coords[j + 1] !== undefined) {
                    for (k = 0; k < snakes[i].coords[j].length; k += 1) {
                        if (((coord[k] >= Math.min(snakes[i].coords[j][k], snakes[i].coords[j + 1][k])) && (coord[k] <= Math.max(snakes[i].coords[j][k], snakes[i].coords[j + 1][k])))) {
                            acc += 1;
                        }
                    }
                    if (acc === (snakes[i].coords[j].length - 1)) {
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

/// Calcule la probabilite pour le point (x,y) a partir d'un snake (px,py)
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

function distance(x, y, px, py) {
    'use strict';
    return Math.abs(x - px) + Math.abs(y - py);
}

/// Met a jour la matrice des probabilites pour un snake positionne en (x,y) et dirige vers direction.
function update_probs(x, y, probability_matrix) {
    'use strict';
    var void_radius = 2,
        radius = 5,
        px,
        py;

    for (px = x - radius; px < x + radius; px += 1) {
        for (py = y - radius; py < y + radius; py += 1) {
            if (distance(x, y, px, py) <= radius && distance(x, y, px, py) >= void_radius) {
                probability_matrix = matrix_pos(x, y, px, py, probability_matrix);
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
        sum = 0, // Somme des probabilites
        probs = [], // Probabilite a l'index i
        probx = [], // Position x de la probabilite a l'index i
        proby = [], // Position y de la probabilite a l'index i
        x,
        y,
        r,
        ecc = 0,
        index,
        coord;

    /*
     * Generation du tableau des probabilites.
     */
    for (i in snakes) {
        if (snakes.hasOwnProperty(i)) {
            currentSnake = snakes[i];
            if (currentSnake.coords !== undefined) {
                probability_matrix = update_probs(currentSnake.coords[0][0], currentSnake.coords[0][1], probability_matrix);
            }
        }
    }

    /*
     * Preparation du traitement des probabilites.
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
     * Sélection d'une coordonnee aleatoire selon les probabilites.
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