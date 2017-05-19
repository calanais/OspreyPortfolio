'use strict';

const fs = require('fs');
const Handlebars = require('handlebars');
const path = require('path');

let imgFiles = fs.readdirSync('./imgs','utf8');


// let imgData = [];
var data = { "images": [] };
for (let i = 0; i < imgFiles.length; i++) {
    let fileinfo = path.parse(imgFiles[i]);
    data.images.push({ 'filename' : fileinfo.base , 'title':fileinfo.name });
}

var source = fs.readFileSync('template.ht','utf8');
var template = Handlebars.compile(source);

var result = template(data);

fs.writeFileSync('portfolio.html',result,'utf8');
