const pug = require('pug');

// Helper para compilar e renderizar
function renderPug(fileName, data) {
    return pug.renderFile(`./views/${fileName}.pug`, data);
}

exports.examesListPage = (elist, d) => renderPug('index', { list: elist, date: d });
exports.emdIndividualPage = (e, d) => renderPug('emdpage', {e: e , date: d });
exports.emdFormPage = (d) => renderPug('form', {date: d});
exports.emdEditFormPage = (e,d) => renderPug('form', {exame: e , date: d});
exports.statsPage = (s, d) => renderPug('stats', {stats: s, date: d});
