import { src, dest, watch, series, parallel } from 'gulp';
import { deleteAsync } from 'del';
import browserSync from 'browser-sync';
import concat from 'gulp-concat';
import terser from 'gulp-terser';
import logSymbols from 'log-symbols';
import replace from 'gulp-replace';
import postcss from 'gulp-postcss';
import tailwindcss from '@tailwindcss/postcss';

// Configuration
const options = {
  config: {
    port: 3000
  },
  paths: {
    root: './',
    src: {
      base: './src',
      css: './src/css',
      tailwindcss: './src/tailwindcss',
      js: './src/js',
      img: './src/img'
    },
    dist: {
      base: './dist',
      css: './dist/css',
      js: './dist/js'
    },
    vendors: './vendors'
  }
};

// Load Previews on Browser on dev
function livePreview(done) {
  console.log('\n\t' + logSymbols.info, 'Starting live preview...\n');
  browserSync.init({
    files: './**/*.html',
    startPath: './',
    server: {
      baseDir: './'
    },
    port: options.config.port || 5000
  });
  done(); // complete
}

function watchFiles() {
  watch('./**/*.html', series(devStyles, previewReload));
  watch(options.paths.src.js + '/script.js', series(previewReload));
  console.log('\n\t' + logSymbols.info, 'Watching for Changes..\n');
}

function previewReload(done) {
  console.log('\n\t' + logSymbols.info, 'Reloading Browser Preview.\n');
  browserSync.reload();
  done(); // complete
}

// delete dist
function devClean(done) {
  console.log('\n\t' + logSymbols.info, 'Cleaning dist folder for fresh start.\n');
  deleteAsync([options.paths.dist.base]).then(() => done()); // complete
}

// generate css
function devStyles(done) {
  console.log('\n\t' + logSymbols.info, 'Generating CSS...\n');
  src(options.paths.src.tailwindcss + '/tailwindcss.css')
    .pipe(postcss([
      tailwindcss()
    ]))
    .pipe(replace('/*! tailwindcss v4.0.0 | MIT License | https://tailwindcss.com */', '/*! Theme Futurism v1.1.0 | tailwindcss v4.0.0 */')) // Replacing the comment
    .pipe(concat({ path: 'style.css' }))
    .pipe(dest(options.paths.src.css))
    .on('end', done); // complete
}

// minify css
function prodStyles(done) {
  console.log('\n\t' + logSymbols.info, 'Minifying CSS...\n');
  src(options.paths.src.css + '/style.css')
    .pipe(replace(/\s+/g, ' '))
    .pipe(replace('{ ', '{'))
    .pipe(replace(' }', '}'))
    .pipe(replace('; ', ';'))
    .pipe(replace(': ', ':'))
    .pipe(dest(options.paths.dist.css))
    .on('end', done); // complete
}

// minify js
function prodScripts(done) {
  console.log('\n\t' + logSymbols.info, 'Minifying JS...\n');
  src([
    options.paths.src + '/js/script.js',
    options.paths.vendors + '/@alpinejs/intersect/dist/cdn.min.js',
    options.paths.vendors + '/alpinejs/dist/cdn.min.js'
  ])
  .pipe(concat({ path: 'scripts.js' }))
  .pipe(terser())
  .pipe(dest(options.paths.dist.js))
  .on('end', done); // complete
}

// finish log
function buildFinish(done) {
  console.log('\n\t' + logSymbols.info, `Production is complete. Files are located at ${options.paths.dist.base}\n`);
  done(); // complete
}

// Clean vendors
function cleanvendor(done) {
  console.log('\n\t' + logSymbols.info, 'Cleaning vendors folder...\n');
  deleteAsync([options.paths.vendors]).then(() => done()); // complete
}

// Copy File from vendors
function copyvendors(done) {
  console.log('\n\t' + logSymbols.info, 'Copying vendors...\n');
  src([
    './node_modules/*@yaireo/tagify/**/*',
    './node_modules/*@alpinejs/intersect/**/*',
    './node_modules/*@splidejs/splide/**/*',
    './node_modules/*flatpickr/**/*',
    './node_modules/*alpinejs/**/*',
    './node_modules/*chart.js/**/*',
    './node_modules/*bootstrap-icons/**/*',
    './node_modules/*dropzone/**/*',
    './node_modules/*glightbox/**/*',
    './node_modules/*jsvectormap/**/*',
    './node_modules/*prismjs/**/*',
    './node_modules/*simple-datatables/**/*',
    './node_modules/*simplemde/**/*'
  ])
    .pipe(dest(options.paths.vendors))
    .on('end', done); // complete
}

export const updateplugins = series(cleanvendor, copyvendors);
export default series(devClean, devStyles, livePreview, watchFiles);

export const prod = series(
  devClean,
  prodStyles,
  prodScripts,
  buildFinish
);
