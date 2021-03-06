/*jslint node: true*/

function coordsbetween(coords, upper, lower) {
    'use strict';
    var acc = 0,
        k;
    for (k = 0; k < coords.length; k += 1) {
        if (((coords[k] >= Math.min(lower[k], upper[k])) && (coords[k] <= Math.max(lower[k], upper[k])))) {
            acc += 1;
        }
    }
    return acc === k;
}

function surunserpent(coord, snakes) {
    'use strict';
    var i, j;
    for (i in snakes) {
        if (snakes.hasOwnProperty(i)) {
            for (j = 0; j < snakes[i].coords.length; j += 1) {
                if (snakes[i].coords[j + 1] !== undefined) {
                    if (coordsbetween(coord, snakes[i].coords[j], snakes[i].coords[j + 1])) {
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

    var delta_total = Math.abs(x - px) + Math.abs(y - py);

    if (delta_total > 0) {
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
        probability_matrix_chevre,
        sum = 0, // Somme des probabilites
        probs = [], // Probabilite a l'index i
        x,
        y,
        r,
        ecc = 0,
        index,
        coord,
        probability_matrix;


    // Generation du tableau des probabilites.
    for (i in snakes) {
        if (snakes.hasOwnProperty(i)) {
            currentSnake = snakes[i];
            if (currentSnake.coords !== undefined) {
                probability_matrix_chevre = update_probs(currentSnake.coords[0][0], currentSnake.coords[0][1], []);
                if (probability_matrix === undefined) {
                    probability_matrix = probability_matrix_chevre;
                } else {
                    for (x in probability_matrix_chevre) {
                        if (probability_matrix_chevre.hasOwnProperty(x)) {
                            x = parseInt(x, 10);
                            if (probability_matrix[x] === undefined) {
                                probability_matrix[x] = probability_matrix_chevre[x];
                            } else {
                                for (y in probability_matrix_chevre[x]) {
                                    if (probability_matrix_chevre[x].hasOwnProperty(y)) {
                                        y = parseInt(y, 10);
                                        if (probability_matrix[x][y] === undefined) {
                                            probability_matrix[x][y] = probability_matrix_chevre[x][y];
                                        } else {
                                            probability_matrix[x][y] += probability_matrix_chevre[x][y];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Preparation du traitement des probabilites.

    for (x in probability_matrix) {
        if (probability_matrix.hasOwnProperty(x)) {
            for (y in probability_matrix[x]) {
                if (probability_matrix[x].hasOwnProperty(y)) {
                    sum += probability_matrix[x][y];
                    probs.push([probability_matrix[x][y], x, y]);
                }
            }
        }
    }

    // Selection d'une coordonnee aleatoire selon les probabilites.

    r = Math.ceil(Math.random() * sum);

    for (index = 0; index < probs.length; index += 1) {
        ecc += probs[index][0];
        if (ecc >= r) {
            coord = [parseInt(probs[index][1], 10), parseInt(probs[index][2], 10)];

            if (!surunserpent(coord, snakes) && !surunbonus(coord, bonus)) {
                return coord;
            }
        }
    }
}

module.exports.genBonusCoords = genBonusCoords;
