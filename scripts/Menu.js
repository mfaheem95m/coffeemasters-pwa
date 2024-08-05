import API from './API.js';

const Menu = {
    data: null,
    openDB: async () => {
        return await idb.openDB('cm-menu', 1, {
            upgrade(db) {
                db.createObjectStore("categories", {
                    keyPath: 'name'
                })
            }
        })
    },
    load: async () => {
        const db = await Menu.openDB();

        try {
            //we try to fetch from the network first 
            const data = await API.fetchMenu();
            Menu.data = data;
            console.log("Data from the server");

            // If succeeded, also update the cache version 
            db.clear('categories');
            data.forEach((category) => db.add("categories", category))
        } catch (e) {
            //network error
            if (await db.count("categories") > 0) {
                Menu.data = await db.getAll('categories');
                console.log("Data from the cache");
            } else {
                // No cache data is available
                console.log("No Data is available ");
            }
        }
        Menu.render();

        if (Menu.data) {
            const imageCache = await caches.open("cm-images");
            Menu.data.forEach(category => imageCache.addAll(
                category.products.map(p => `/data/images/${p.image}`)
            ))
        }
    },
    loadCacheFirst: async () => {
        //CACHE FIRST 

        const db = await Menu.openDB();
        if (await db.count("categories") == 0) {
            const categories = await API.fetchMenu();
            categories.forEach((category) => db.add("categories", category))
        }
        Menu.data = await db.getAll("categories");
        Menu.render();
    },
    getProductById: async id => {
        if (Menu.data == null) {
            await Menu.load();
        }
        for (let c of Menu.data) {
            for (let p of c.products) {
                if (p.id == id) {
                    return p;
                }
            }
        }
        return null;
    },
    render: () => {
        let html = "";
        for (let category of Menu.data) {
            html += `
                <li>
                    <h3>${category.name}</h3>
                    <ul class='category'>
                        ${category.products.map(p => `
                                <li>
                                    <article>
                                        <a href="#" 
                                            onclick="Router.go('/product-${p.id}');event.preventDefault()">
                                            <img src="/data/images/${p.image}">
                                            <h4>${p.name}</h4>
                                            <p class="price">$${p.price.toFixed(2)}<p>
                                        </a>
                                    </article>
                                </li>
                            `).join("")
                }
                    </ul>
                </li>`;
        }
        document.querySelector("#menu").innerHTML = html;
    },
    renderDetails: async id => {
        const product = await Menu.getProductById(id);
        if (product == null) {
            console.log(`Product ${id} not found`);
            return;
        }
        document.querySelector("#details article").innerHTML = ` 
            <header>   
                <a href="#" onclick="Router.go('/'); event.preventDefault()">&lt; Back</a>
                <h2>${product.name}</h2>
                <a></a>
            </header>
            <img src="/data/images/${product.image}">
            <p class="description">${product.description}</p>
            <p class="price">$ ${product.price.toFixed(2)} ea</p>
            <button onclick="Order.add(${product.id}); Router.go('/order')">Add to cart</button>
        `;
    }

}

export default Menu;