import fs from 'node:fs';

const content = fs.readFileSync('./public/assets/index-Cl4wZyAe.js', 'utf8');
const regex = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-_?=&#;]+/g;
const matches = content.match(regex) || [];
console.log('Unsplash images:', [...new Set(matches)]);
