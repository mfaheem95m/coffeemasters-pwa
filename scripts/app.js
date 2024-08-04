import Menu from './Menu.js';
import Order from './Order.js';
import Router from './Router.js';


(async function () {
    if (navigator.storage && navigator.storage.persist) {  
        if (!await navigator.storage.persisted()) {
            const result = await navigator.storage.persist();
            console.log(`Persisted request returned : ${result}`)
        }
    }
})();

(async function () {
    if (navigator.storage && navigator.storage.estimate) {
        const q = await navigator.storage.estimate();
        console.log(`quota available ${q.quota / 1024 / 1024} MB`)
        console.log(`quota available ${q.quota / 1024} KB`)
    }
})();

window.addEventListener("DOMContentLoaded", () => {
    Router.init();
    Menu.load();
    Order.render();
 } );
