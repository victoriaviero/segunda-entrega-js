const productos = document.getElementById("productos")
const templateCard = document.getElementById("template-card").content
const fragment = document.createDocumentFragment() /* memoria volatil para traer los template, no queda en el DOM*/
let carrito = {} /* es una coleccion de objetos, no un array*/
const templateFooter = document.getElementById("template-footer").content
const templateCarrito = document.getElementById("template-carrito").content
const elementosEnCarrito = document.getElementById("elementos-en-carrito")
const footer = document.getElementById("footer")
const finalizarCompra = document.getElementById("finalizar-compra")


document.addEventListener('DOMContentLoaded', () => {
    fetchData()
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        mostrarTodoEnCarrito()
}
});

productos.addEventListener("click", e =>{
    agregarCarrito(e)
})

const fetchData = async () => {
    try {
        const respuesta = await fetch("info.json")
        const datos = await respuesta.json()
        mostrarCards(datos)
    } catch (error) {
        console.log(error)
    }
}

const mostrarCards = datos =>{
    datos.forEach(producto =>{
        templateCard.querySelector("h5").textContent = producto.nombre
        templateCard.querySelector("p").textContent = producto.precio
        templateCard.querySelector("img").setAttribute("src", producto.img);
        templateCard.querySelector(".btn-dark").dataset.id = producto.id

        const clone = templateCard.cloneNode(true)
        fragment.appendChild(clone)
    })
    productos.appendChild(fragment)
}

const agregarCarrito = e => {
    if (e.target.classList.contains("btn-dark")){
        mostrarTodoEnCarrito(e.target.parentElement)
    }
    e.stopPropagation()
}

const mostrarTodoEnCarrito = objeto =>{
    const producto = {
        id: objeto.querySelector(".btn-dark").dataset.id,
        nombre: objeto.querySelector("h5").textContent,
        precio: objeto.querySelector("p").textContent,
        cantidad: 1
    }
    if (carrito.hasOwnProperty(producto.id)){
        producto.cantidad = carrito[producto.id].cantidad + 1
    }
    carrito[producto.id] = {...producto}
    mostrarCompraCarrito()
}

const mostrarCompraCarrito = datos => {
    elementosEnCarrito.innerHTML = ""
    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id
        templateCarrito.querySelectorAll('td')[0].textContent = producto.titulo
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad
        templateCarrito.querySelector('span').textContent = producto.precio * producto.cantidad
        templateCarrito.querySelector(".btn-info").dataset.id = producto.id
        templateCarrito.querySelector(".btn-danger").dataset.id = producto.id
        const clone = templateCarrito .cloneNode(true)
        fragment.appendChild(clone)
    })
    elementosEnCarrito.appendChild(fragment)

    mostrarTotalFooter()

    localStorage.setItem('carrito', JSON.stringify(carrito))
}

const mostrarTotalFooter = () =>{
    footer.innerHTML = ""
    if (Object.keys(carrito).length === 0) {
        footer.innerHTML = '<th scope="row" colspan="5">No hay nada en el carrito!</th>'
        return
    }
    const cantidadTotal = Object.values(carrito).reduce((acc, {cantidad}) => acc + cantidad, 0)
    const precioTotal = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad * precio, 0)
    console.log(precioTotal)

    templateFooter.querySelectorAll("td")[0].textContent = cantidadTotal
    templateFooter.querySelector("span").textContent = precioTotal

    const clone = templateFooter.cloneNode (true)
    fragment.appendChild(clone)
    footer.appendChild(fragment)

    const vaciarCarrito = document.getElementById("vaciar-carrito")
    vaciarCarrito.addEventListener('click', () => {
        carrito = {}
        mostrarCompraCarrito()
    })
    finalizarCompra.addEventListener("click", e =>{
        const cantidadTotal = Object.values(carrito).reduce((acc, {cantidad}) => acc + cantidad, 0)
        const precioTotal = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad * precio, 0)
        if(precioTotal === 0){
            Swal.fire({
                title: "El carrito esta vacio!",
                icon: "error"
              });
          }
        else{
            Swal.fire({
                title: "Quiere confirmar la compra?",
                text: "El total es de $" + precioTotal,
                icon: "success",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Si! Comprar!"
              }).then((result) => {
                if (result.isConfirmed) {
                    carrito = {}
                  Swal.fire({
                    title: "Compra realizada con exito!",
                    icon: "success"
                  });
                  mostrarCompraCarrito();
                }
              });
        }
          
    })
}

elementosEnCarrito.addEventListener('click', e => {
    botonesMasMenos(e)
})
const botonesMasMenos = e =>{
    if(e.target.classList.contains("btn-info")){
        const producto = carrito[e.target.dataset.id]
        producto.cantidad++
        carrito[e.target.dataset.id] = {...producto}
        mostrarCompraCarrito()
    }
    if(e.target.classList.contains("btn-danger")){
        const producto = carrito[e.target.dataset.id]
        producto.cantidad--
        carrito[e.target.dataset.id] = {...producto}
        if(producto.cantidad===0){
            delete carrito[e.target.dataset.id]
        }
        mostrarCompraCarrito()
    }
    e.stopPropagation()
}

finalizarCompra.addEventListener('click', e =>{
    confirmarCompra (e)
})